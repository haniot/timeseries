import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IDatabase } from '../port/database.interface'
import { IntradayTimeSeries } from '../../application/domain/model/intraday.time.series'
import { IIntradayTimeSeriesRepository } from '../../application/port/intraday.time.series.repository.interface'

/**
 * Implementation of the Time Series repository.
 *
 * @implements {ITimeSeriesRepository}
 */
@injectable()
export class IntradayTimeSeriesRepository implements IIntradayTimeSeriesRepository {
    constructor(
        @inject(Identifier.INFLUXDB_CONNECTION) private readonly _db: IDatabase,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this._logger.info('tet')
        this._db.connection
    }

    public create(item: IntradayTimeSeries): Promise<IntradayTimeSeries> {
        throw new Error('Unsupported feature!')
    }

    public delete(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    public listByInterval(patientId: string, type: string, date: string, interval: string): Promise<IntradayTimeSeries> {
        throw new Error('Unsupported feature!')
    }

    public listByIntervalAndTime(patientId: string, type: string,
                                 startDate: string, endDate: string,
                                 startTime: string, endTime: string,
                                 interval: string): Promise<IntradayTimeSeries> {
        throw new Error('Unsupported feature!')
    }
}
