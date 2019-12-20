import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IIntradayTimeSeriesRepository } from '../port/intraday.time.series.repository.interface'
import { IIntradayTimeSeriesService } from '../port/intraday.time.series.service.interface'
import { IntradayTimeSeries } from '../domain/model/intraday.time.series'

/**
 * Implementing Intraday ime Series Service.
 *
 * @implements {ITimeSeriesService}
 */
@injectable()
export class IntradayTimeSeriesService implements IIntradayTimeSeriesService {

    constructor(@inject(Identifier.INTRADAY_REPOSITORY) private readonly _intradayRepository: IIntradayTimeSeriesRepository
                // @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                // @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public listByInterval(patientId: string, type: string, date: string, interval: string): Promise<IntradayTimeSeries> {
        return this._intradayRepository.listByInterval(patientId, type, date, interval)
    }

    public listByIntervalAndTime(patientId: string, type: string,
                                 startDate: string, endDate: string,
                                 startTime: string, endTime: string,
                                 interval: string): Promise<IntradayTimeSeries> {
        return this._intradayRepository.listByIntervalAndTime(patientId, type, startDate, endDate,
            startTime, endTime, interval)
    }

    public add(item: IntradayTimeSeries): Promise<IntradayTimeSeries> {
        throw new Error('Unsupported feature!')
    }

    public remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
