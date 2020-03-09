import moment from 'moment'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IDatabase } from '../port/database.interface'
import { IntradayTimeSeries } from '../../application/domain/model/intraday.time.series'
import { IIntradayTimeSeriesRepository } from '../../application/port/intraday.time.series.repository.interface'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { IntradayTimeSeriesEntity } from '../entity/intraday.time.series.entity'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { Strings } from '../../utils/strings'
import { Default } from '../../utils/default'
import { TimeSeriesType } from '../../application/domain/utils/time.series.type'
import { heartRateZonesSchema } from '../database/schema/heartRateZonesSchema'
import { intradayTimeSeriesSchema } from '../database/schema/intraday.time.series.schema'

/**
 * Implementation of the Time Series infrastructure.
 *
 * @implements {ITimeSeriesRepository}
 */
@injectable()
export class IntradayTimeSeriesRepository implements IIntradayTimeSeriesRepository {
    constructor(
        @inject(Identifier.INFLUXDB_CONNECTION) private readonly _db: IDatabase,
        @inject(Identifier.INTRADAY_ENTITY_MAPPER)
        private readonly _mapper: IEntityMapper<IntradayTimeSeries, IntradayTimeSeriesEntity>,
        @inject(Identifier.LOGGER) protected readonly _logger: ILogger
    ) {
        this._db.connection?.addSchema(intradayTimeSeriesSchema)
        this._db.connection?.addSchema(heartRateZonesSchema)
    }

    public create(item: IntradayTimeSeries): Promise<IntradayTimeSeries> {
        return new Promise(async (resolve, reject) => {
            if (!this._db.connection) {
                return reject(new RepositoryException(Strings.ERROR_MESSAGE.CONNECTION_NOT_EXIST))
            }

            try {
                // Preparing the measure to be entered all at once
                const data: IntradayTimeSeriesEntity = this._mapper.transform(item)

                // add intraday
                await this._db.connection.writePoints(data.points)
                // add heart rate zones
                if (data.pointsHrZones) await this._db.connection.writePoints(data.pointsHrZones)
                resolve()
            } catch (err) {
                this._logger.error(err)
                return reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
            }
        })
    }

    public delete(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!this._db.connection) {
                return reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
            }

            this._db.connection
                .query(`DROP SERIES FROM ${Default.MEASUREMENT_TIMESERIES_NAME} WHERE user_id = '${id}';
                    DROP SERIES FROM ${Default.MEASUREMENT_HR_ZONES_NAME} WHERE user_id = '${id}';`
                )
                .then(() => resolve(true))
                .catch((err) => {
                    this._logger.error(err)
                    return reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
                })
        })
    }

    public listByInterval(patientId: string, type: string, date: string, interval: string): Promise<IntradayTimeSeries> {
        let endTime = '23:59:59'
        if (moment(date).isSame(new Date(), 'day')) {
            endTime = moment().format(`HH:mm:ss`)
        }
        return this.listByIntervalAndTime(patientId, type, date, date, '00:00:00', endTime, interval)
    }

    public listByIntervalAndTime(patientId: string, type: string,
                                 startDate: string, endDate: string,
                                 startTime: string, endTime: string,
                                 interval: string): Promise<IntradayTimeSeries> {
        if (!this._db.connection) {
            throw new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED)
        }

        startTime = moment(`${startDate}T${startTime}`).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
        endTime = moment(`${endDate}T${endTime}`).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)

        const offsetInterval: string = interval.includes('m') ? `${moment(startTime).get('minutes')}m` :
            `${moment(startTime).get('seconds')}s`

        if (type !== TimeSeriesType.HEART_RATE) return this.buildResult(patientId, type, startTime, endTime,
            interval, offsetInterval)
        return this.buildResultHR(patientId, startTime, endTime, interval, offsetInterval)
    }

    /**
     * Converts the result of the database query to the expected format.
     *
     * @param patientId
     * @param type
     * @param startTime
     * @param endTime
     * @param interval
     * @param offsetInterval
     */
    private async buildResult(patientId: string, type: string,
                              startTime: string, endTime: string,
                              interval: string, offsetInterval: string): Promise<IntradayTimeSeries> {
        return new Promise<IntradayTimeSeries>(async (resolve, reject) => {
            const query: Array<string> = this.buildQuery(patientId, type, startTime, endTime, interval, offsetInterval)
            this._db.connection!.query(query)
                .then((res: Array<any>) => {
                    const result: any = { type, interval, start_time: startTime, end_time: endTime, total: 0 }
                    result.data_set = res[0]
                    if (res[1].groupRows.length) result.total = res[1][0].total
                    return resolve(this._mapper.transform(result))
                })
                .catch(err => {
                    this._logger.error(err)
                    return reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
                })
        })
    }

    /**
     * Converts the result of querying the heart rate database to the expected format.
     *
     * @param patientId
     * @param startTime
     * @param endTime
     * @param interval
     * @param offsetInterval
     */
    private async buildResultHR(patientId: string, startTime: string, endTime: string,
                                interval: string, offsetInterval: string): Promise<IntradayTimeSeries> {
        return new Promise<IntradayTimeSeries>(async (resolve, reject) => {
            const query: Array<string> = this.buildQueryHeartRate(patientId, startTime, endTime, interval, offsetInterval)

            this._db.connection!.query(query)
                .then(async (res: Array<any>) => {
                    const result: any = {
                        type: TimeSeriesType.HEART_RATE, interval, start_time: startTime,
                        end_time: endTime, min: 0, max: 0, average: 0, zones: []
                    }
                    // heart rate
                    result.data_set = res[0]
                    if (res[1].groupRows.length) {
                        result.min = res[1][0].min
                        result.max = res[1][0].max
                        result.average = res[1][0].average
                    }
                    const dateTime = moment(startTime).set({ hours: 0, minutes: 0, seconds: 0 }).format()
                    result.zones = await this.getZones(patientId, dateTime)
                    if (interval !== '1m') {
                        result.data_set_base = res[2]
                        result.calories = res[3]
                    } else {
                        result.data_set_base = res[0]
                        result.calories = res[2]
                    }
                    return resolve(this._mapper.transform(result))
                })
                .catch(err => {
                    this._logger.error(err)
                    return reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
                })
        })
    }

    /**
     * Retrieves heart rate zones from database.
     * If there is no zone on the specified date the last ones are retrieved.
     *
     * @param patientId
     * @param datetime
     */
    private async getZones(patientId: string, datetime: string): Promise<Array<any>> {
        try {
            let result: Array<any> = await this._db.connection!.query([
                `SELECT min, max, "duration", calories, type FROM ${Default.MEASUREMENT_HR_ZONES_NAME}
                    WHERE user_id = '${patientId}'
                    AND time >= '${datetime}'
                    AND time <= '${datetime}';`
            ])
            if (!result.length) {
                result = await this._db.connection!.query(
                    `SELECT min, max, "duration", calories, type FROM ${Default.MEASUREMENT_HR_ZONES_NAME}
                        WHERE user_id = '${patientId}' ORDER BY time DESC LIMIT 4;`
                )
            }
            return result
        } catch (err) {
            this._logger.error(err)
            throw new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED)
        }
    }

    /**
     * Create the query for steps, calories, distance or active_minutes according to the parameters.
     * Two SELECTs are created:
     *   1. with the time series in the range
     *   2. with the sum.
     *
     * @param patientId
     * @param type
     * @param startTime
     * @param endTime
     * @param interval
     * @param offsetInterval
     */
    private buildQuery(patientId: string, type: string,
                       startTime: string, endTime: string,
                       interval: string, offsetInterval: string): Array<string> {
        return [
            `SELECT SUM(value) as value FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${type}'
                AND time >= '${startTime}'
                AND time <= '${endTime}'
                GROUP BY time(${interval}, ${offsetInterval}) fill(0) ORDER BY time ASC;`,
            `SELECT SUM(value) as total FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${type}'
                AND time >= '${startTime}'
                AND time <= '${endTime}';`
        ]
    }

    /**
     * Create the query for heart rate according to the parameters.
     * Three SELECTs are created:
     *   1. with the time series in the range,
     *   2. with the minimum, maximum and average heart rate,
     *   3. with the time series of calories in the range,
     *
     * @param patientId
     * @param startTime
     * @param endTime
     * @param interval
     * @param offsetInterval
     */
    private buildQueryHeartRate(patientId: string, startTime: string, endTime: string,
                                interval: string, offsetInterval: string): Array<string> {
        if (interval.includes('m')) { // minutes
            endTime = moment(endTime).utc().set({ seconds: 59 }).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
        }

        const subQuery = `SELECT ROUND(MEAN(value)) as value FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${TimeSeriesType.HEART_RATE}'
                AND time >= '${startTime}'
                AND time <= '${endTime}'
                GROUP BY time(1m) fill(none) ORDER BY time ASC;`

        const query = [
            `SELECT ROUND(MEAN(value)) as value FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${TimeSeriesType.HEART_RATE}'
                AND time >= '${startTime}'
                AND time <= '${endTime}'
                GROUP BY time(${interval}, ${offsetInterval}) fill(none) ORDER BY time ASC;`,
            `SELECT MIN(value), MAX(value), ROUND(MEAN(value)) as average FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${TimeSeriesType.HEART_RATE}'
                AND time >= '${startTime}'
                AND time <= '${endTime}';`,
            `SELECT SUM(value) as value FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${TimeSeriesType.CALORIES}'
                AND time >= '${startTime}'
                AND time <= '${endTime}'
                GROUP BY time(1m) fill(0) ORDER BY time ASC;`
        ]

        if (interval !== '1m') {
            query.splice(2, 0, subQuery)
        }
        return query
    }
}
