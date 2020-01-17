import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IIntradayTimeSeriesRepository } from '../port/intraday.time.series.repository.interface'
import { IIntradayTimeSeriesService } from '../port/intraday.time.series.service.interface'
import { IntradayTimeSeries } from '../domain/model/intraday.time.series'
import { IntradayListTimeValidator } from '../domain/validator/intraday.list.time.validator'
import { DateValidator } from '../domain/validator/date.validator'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { ResourceTypeValidator } from '../domain/validator/resource.type.validator'
import { IntervalValidator } from '../domain/validator/interval.validator'

/**
 * Implementation intraday time series service.
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
        try {
            ObjectIdValidator.validate(patientId)
            ResourceTypeValidator.validate(type)
            DateValidator.validate(date)
            IntervalValidator.validate(interval)
            return this._intradayRepository.listByInterval(patientId, type, date, interval)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    public listByIntervalAndTime(patientId: string, type: string,
                                 startDate: string, endDate: string,
                                 startTime: string, endTime: string,
                                 interval: string): Promise<IntradayTimeSeries> {
        try {
            IntradayListTimeValidator.validate(patientId, type, startDate, endDate, startTime, endTime, interval)
            return this._intradayRepository.listByIntervalAndTime(
                patientId, type,
                startDate, endDate,
                startTime, endTime, interval
            )
        } catch (e) {
            return Promise.reject(e)
        }
    }

    public add(item: IntradayTimeSeries): Promise<IntradayTimeSeries> {
        return this._intradayRepository.create(item)
    }

    public remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
