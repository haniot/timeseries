import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ITimeSeriesRepository } from '../../application/port/timeseries.repository.interface'
import { IDatabase } from '../port/database.interface'
import { TimeSeries } from '../../application/domain/model/time.series'
import { TimeSeriesGroup } from '../../application/domain/model/time.series.group'

/**
 * Implementation of the Time Series repository.
 *
 * @implements {ITimeSeriesRepository}
 */
@injectable()
export class TimeSeriesRepository implements ITimeSeriesRepository {
    constructor(
        @inject(Identifier.INFLUXDB_CONNECTION) private readonly _db: IDatabase,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this._logger.info('tet')
        this._db.connection
    }

    public create(item: TimeSeries): Promise<TimeSeries> {
        throw new Error('Unsupported feature!')
    }

    public delete(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    public listAll(patientId: string, startDate: string, endDate: string): Promise<TimeSeriesGroup> {
        throw new Error('Unsupported feature!')
    }

    public listByType(patientId: string, type: string, startDate: string, endDate: string): Promise<TimeSeries> {
        throw new Error('Unsupported feature!')
    }
}
