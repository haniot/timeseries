import { inject, injectable } from 'inversify'
import { ITimeSeriesService } from '../port/timeseries.service.interface'
import { Identifier } from '../../di/identifiers'
import { ITimeSeriesRepository } from '../port/timeseries.repository.interface'
import { TimeSeries } from '../domain/model/time.series'
import { TimeSeriesGroup } from '../domain/model/time.series.group'

/**
 * Implementing Time Series Service.
 *
 * @implements {ITimeSeriesService}
 */
@injectable()
export class TimeSeriesService implements ITimeSeriesService {

    constructor(@inject(Identifier.TIMESERIES_REPOSITORY) private readonly _timeSeriesRepository: ITimeSeriesRepository
                // @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
                // @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public listAll(patientId: string, startDate: string, endDate: string): Promise<TimeSeriesGroup> {
        return this._timeSeriesRepository.listAll(patientId, startDate, endDate)
    }

    public listByType(patientId: string, type: string, startDate: string, endDate: string): Promise<TimeSeries> {
        return this._timeSeriesRepository.listByType(patientId, type, startDate, endDate)
    }

    public add(item: TimeSeries): Promise<TimeSeries> {
        throw new Error('Unsupported feature!')
    }

    public remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }
}
