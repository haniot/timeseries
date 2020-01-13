import moment from 'moment'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ITimeSeriesRepository } from '../../application/port/timeseries.repository.interface'
import { IDatabase } from '../port/database.interface'
import { TimeSeries } from '../../application/domain/model/time.series'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { TimeSeriesEntity } from '../entity/time.series.entity'
import { Default } from '../../utils/default'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { Strings } from '../../utils/strings'
import { TimeSeriesType } from '../../application/domain/utils/time.series.type'
import { intradayTimeSeriesSchema } from '../database/schema/intraday.time.series.schema'
import { heartRateZonesSchema } from '../database/schema/heartRateZonesSchema'

/**
 * Implementation of the Time Series infrastructure.
 *
 * @implements {ITimeSeriesRepository}
 */
@injectable()
export class TimeSeriesRepository implements ITimeSeriesRepository {
    constructor(
        @inject(Identifier.INFLUXDB_CONNECTION) private readonly _db: IDatabase,
        @inject(Identifier.TIME_SERIES_ENTITY_MAPPER) private readonly _mapper: IEntityMapper<TimeSeries, TimeSeriesEntity>,
        @inject(Identifier.LOGGER) protected readonly _logger: ILogger
    ) {
        this._db.connection?.addSchema(intradayTimeSeriesSchema)
        this._db.connection?.addSchema(heartRateZonesSchema)
    }

    public create(item: TimeSeries): Promise<TimeSeries> {
        return new Promise((resolve, reject) => {
            if (!this._db.connection) {
                return reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
            }

            // Preparing the measure to be entered all at once
            this._db.connection
                .writePoints((this._mapper.transform(item) as TimeSeriesEntity).points)
                .then((result) => resolve())
                .catch((err) => {
                    this._logger.error(err)
                    return reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
                })
        })
    }

    public delete(id: string): Promise<boolean> {
        throw new Error('Not implemented!')
    }

    public async listByType(patientId: string, startDate: string, endDate: string, type: string): Promise<TimeSeries> {
        if (!this._db.connection) {
            throw new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED)
        }

        const startTime = moment(`${startDate}T00:00:00`).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
        const endTime = moment(`${endDate}T23:59:59`).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)

        if (type !== TimeSeriesType.HEART_RATE) return this.buildResult(patientId, type, startDate, endDate, startTime, endTime)
        return this.buildResultHR(patientId, startDate, endDate)
    }

    /**
     * Converts the result of the database query to the expected format.
     *
     * @param patientId
     * @param type
     * @param startDate
     * @param endDate
     * @param startTime
     * @param endTime
     */
    private async buildResult(patientId: string, type: string,
                              startDate: string, endDate: string,
                              startTime: string, endTime: string): Promise<TimeSeries> {
        return new Promise<TimeSeries>(async (resolve, reject) => {
            const query: Array<string> = this.buildQuery(patientId, type, startTime, endTime)
            this._db.connection!.query(query)
                .then((res: Array<any>) => {
                    const result: any = { type, start_date: startDate, end_date: endDate, total: 0 }
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
     * @param startDate
     * @param endDate
     */
    private async buildResultHR(patientId: string, startDate: string, endDate: string): Promise<TimeSeries> {
        return new Promise<TimeSeries>(async (resolve, reject) => {
            try {
                const result: any = {
                    type: TimeSeriesType.HEART_RATE, start_date: startDate, end_date: endDate, zones: []
                }
                result.data_set = await this._db.connection!.query(this.buildQueryHR(patientId, startDate, endDate))
                result.calories = await this._db.connection!.query(this.buildQueryCalories(patientId, startDate, endDate))
                result.zones = await this.getZones(patientId, startDate, endDate)

                return resolve(this._mapper.transform(result))
            } catch (err) {
                this._logger.error(err)
                return reject(new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED))
            }
        })
    }

    /**
     * Retrieves heart rate zones from database.
     * If there is no zone on the specified date the last ones are retrieved.
     *
     * @param patientId
     * @param startDate
     * @param endDate
     */
    private async getZones(patientId: string, startDate: string, endDate: string): Promise<any> {
        try {
            const queryZones: string = `SELECT min, max, "duration", calories, type FROM ${Default.MEASUREMENT_HR_ZONES_NAME}
                WHERE user_id = '${patientId}' AND time >= '${startDate}T00:00:00.000Z' AND time <= '${endDate}T00:00:00.000Z';`

            const result: any = { data: [], data_default: [] }
            result.data = await this._db.connection!.query(queryZones)
            result.data_default = await this._db.connection!.query(
                `SELECT min, max, "duration", calories, type FROM ${Default.MEASUREMENT_HR_ZONES_NAME}
                    WHERE user_id = '${patientId}' ORDER BY time DESC LIMIT 4;`
            )
            return result
        } catch (err) {
            this._logger.error(err)
            throw new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED)
        }
    }

    /**
     * Create the query for steps, calories, distance or active_minutes according to the parameters.
     * Two SELECT are created, one with the sum of the day and one with the general sum
     * in the period between start and end date.
     *
     * @param patientId
     * @param type
     * @param startTime
     * @param endTime
     */
    private buildQuery(patientId: string, type: string,
                       startTime: string, endTime: string): Array<string> {
        return [
            `SELECT SUM(value) as value FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${type}'
                AND time >= '${startTime}'
                AND time <= '${endTime}'
                GROUP BY time(1d) fill(0) ORDER BY time ASC;`,
            `SELECT SUM(value) as total FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${type}'
                AND time >= '${startTime}'
                AND time <= '${endTime}';`
        ]
    }

    /**
     *
     * @param patientId
     * @param startDate
     * @param endDate
     */
    private buildQueryHR(patientId: string, startDate: string, endDate: string): Array<string> {
        const result: Array<string> = []

        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        for (const m = moment(startDate); m.isBefore(endDate); m.add(1, 'days')) {
            const currentDate: string = m.format('YYYY-MM-DD')
            const startTime = moment(`${currentDate}T00:00:00`).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
            const endTime = moment(`${currentDate}T23:59:59`).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
            result.push(
                `SELECT ROUND(MEAN(value)) as value FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                    WHERE user_id = '${patientId}'
                    AND type = '${TimeSeriesType.HEART_RATE}'
                    AND time >= '${startTime}'
                    AND time <= '${endTime}'
                    GROUP BY time(1m) fill(none) ORDER BY time ASC;`
            )
        }
        return result
    }

    /**
     *
     * @param patientId
     * @param startDate
     * @param endDate
     */
    private buildQueryCalories(patientId: string, startDate: string, endDate: string): Array<string> {
        const result: Array<string> = []

        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        for (const m = moment(startDate); m.isBefore(endDate); m.add(1, 'days')) {
            const currentDate: string = m.format('YYYY-MM-DD')
            const startTime = moment(`${currentDate}T00:00:00`).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
            const endTime = moment(`${currentDate}T23:59:59`).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
            result.push(
                `SELECT SUM(value) as value FROM ${Default.MEASUREMENT_TIMESERIES_NAME}
                    WHERE user_id = '${patientId}'
                    AND type = '${TimeSeriesType.CALORIES}'
                    AND time >= '${startTime}'
                    AND time <= '${endTime}'
                    GROUP BY time(1m) fill(none) ORDER BY time ASC;`
            )
        }
        return result
    }
}
