import moment from 'moment'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ITimeSeriesRepository } from '../../application/port/timeseries.repository.interface'
import { IDatabase } from '../port/database.interface'
import { TimeSeries } from '../../application/domain/model/time.series'
import { timeSeriesSchema } from '../database/schema/time.series.schema'
import { TimeSeriesType } from '../../application/domain/utils/time.series.type'
import { heartRateTimeSeriesSchema } from '../database/schema/heart.rate.time.series.schema'
import { BaseRepository } from './base/base.repository'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { TimeSeriesEntity } from '../entity/time.series.entity'
import { Default } from '../../utils/default'

/**
 * Implementation of the Time Series infrastructure.
 *
 * @implements {ITimeSeriesRepository}
 */
@injectable()
export class TimeSeriesRepository extends BaseRepository implements ITimeSeriesRepository {
    constructor(
        @inject(Identifier.INFLUXDB_CONNECTION) private readonly _db: IDatabase,
        @inject(Identifier.TIME_SERIES_ENTITY_MAPPER) private readonly _mapper: IEntityMapper<TimeSeries, TimeSeriesEntity>,
        @inject(Identifier.LOGGER) protected readonly _logger: ILogger
    ) {
        super(_logger)
        this._db.connection?.addSchema(timeSeriesSchema)
        this._db.connection?.addSchema(heartRateTimeSeriesSchema)
    }

    public create(item: TimeSeries): Promise<TimeSeries> {
        return new Promise((resolve, reject) => {
            if (!this._db.connection) {
                return reject(super.dbErrorListener(new Error('Instance of database connection does not exist!')))
            }

            // Preparing the measure to be entered all at once
            this._db.connection
                .writePoints((this._mapper.transform(item) as TimeSeriesEntity).points)
                .then((result) => resolve())
                .catch((err) => reject(super.dbErrorListener(err)))
        })
    }

    public delete(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!this._db.connection) {
                return reject(super.dbErrorListener(new Error('Instance of database connection does not exist!')))
            }

            this._db.connection
                .query(`DROP SERIES FROM ${Default.MEASUREMENT_NAME} WHERE user_id = '${id}';
                    DROP SERIES FROM ${Default.MEASUREMENT_HR_NAME} WHERE user_id = '${id}';`
                )
                .then(() => resolve(true))
                .catch((err) => reject(super.dbErrorListener(err)))
        })
    }

    public async listByType(patientId: string, startDate: string, endDate: string, type: string): Promise<TimeSeries> {
        return new Promise<TimeSeries>((resolve, reject) => {
            if (!this._db.connection) {
                return reject(super.dbErrorListener(new Error('Instance of database connection does not exist!')))
            }

            let query: any = this.buildQuery(patientId, startDate, endDate, type)
            if (type === TimeSeriesType.HEART_RATE) query = this.buildQueryHeartRate(patientId, startDate, endDate)

            this._db.connection
                .query(query)
                .then((result: any) => {
                    result = { type, start_date: startDate, end_date: endDate, data_set: result }
                    return resolve(this._mapper.transform(result))
                })
                .catch(err => reject(super.dbErrorListener(err)))
        })
    }

    /**
     * Create the query for steps, calories, distance or active_minutes according to the parameters.
     * Two SELECT are created, one with the sum of the day and one with the general sum
     * in the period between start and end date.
     *
     * @param patientId
     * @param startDate
     * @param endDate
     * @param type
     */
    private buildQuery(patientId: string, startDate: string, endDate: string, type: string): Array<string> {
        return [
            `SELECT SUM(value) as value FROM ${Default.MEASUREMENT_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${type}'
                AND time >= '${startDate}'
                AND time <= '${endDate}'
                GROUP BY time(1d) fill(0) ORDER BY time ASC;`,
            `SELECT SUM(value) as total FROM ${Default.MEASUREMENT_NAME}
                WHERE user_id = '${patientId}'
                AND type = '${type}'
                AND time >= '${startDate}'
                AND time <= '${endDate}';`
        ]
    }

    /**
     * Create the query for heart rate according to the parameters.
     * is creating a SELECT for each day, making it easy to identify days without data,
     * because the query returns an empty array []
     *
     * @param patientId
     * @param startDate
     * @param endDate
     */
    private buildQueryHeartRate(patientId: string, startDate: string, endDate: string): Array<string> {
        const result: Array<string> = []
        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')

        for (const m = moment(startDate); m.isBefore(endDate); m.add(1, 'days')) {
            const currentDate: string = m.format('YYYY-MM-DD')
            result.push(`SELECT min, max, value, calories, type FROM ${Default.MEASUREMENT_HR_NAME}`
                .concat(` WHERE user_id = '${patientId}' AND time >= '${currentDate}' AND time <= '${currentDate}' ORDER BY time DESC`))
        }
        return result
    }
}
