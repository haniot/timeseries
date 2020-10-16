import { inject, injectable } from 'inversify'
import { ITimeSeriesService } from '../port/timeseries.service.interface'
import { Identifier } from '../../di/identifiers'
import { ITimeSeriesRepository } from '../port/timeseries.repository.interface'
import { TimeSeries } from '../domain/model/time.series'
import { TimeSeriesGroup } from '../domain/model/time.series.group'
import { TimeSeriesListValidator } from '../domain/validator/time.series.list.validator'
import { TimeSeriesType } from '../domain/utils/time.series.type'

/**
 * Implementation Time Series Service.
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

    public async listAll(patientId: string, startDate: string, endDate: string): Promise<TimeSeriesGroup> {
        try {
            // Constructs dates in the appropriate format.
            startDate = this.buildDate(startDate)
            endDate = this.buildDate(endDate)

            // Validates params.
            TimeSeriesListValidator.validate(patientId, startDate, endDate)
            const timeSeriesGroup: TimeSeriesGroup = new TimeSeriesGroup()

            // Calls the repository.
            timeSeriesGroup.steps = await this._timeSeriesRepository
                .listByType(patientId, startDate, endDate, TimeSeriesType.STEPS)
            timeSeriesGroup.calories = await this._timeSeriesRepository
                .listByType(patientId, startDate, endDate, TimeSeriesType.CALORIES)
            timeSeriesGroup.distance = await this._timeSeriesRepository
                .listByType(patientId, startDate, endDate, TimeSeriesType.DISTANCE)
            timeSeriesGroup.activeMinutes = await this._timeSeriesRepository
                .listByType(patientId, startDate, endDate, TimeSeriesType.ACTIVE_MINUTES)

            return Promise.resolve(timeSeriesGroup)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    public listByType(patientId: string, startDate: string, endDate: string, type: string): Promise<TimeSeries> {
        try {
            // Constructs dates in the appropriate format.
            startDate = this.buildDate(startDate)
            endDate = this.buildDate(endDate)

            // Validates params.
            TimeSeriesListValidator.validate(patientId, startDate, endDate, type)

            // Calls the repository.
            return this._timeSeriesRepository.listByType(patientId, startDate, endDate, type)
        } catch (e) {
            return Promise.reject(e)
        }
    }

    public add(item: TimeSeries): Promise<TimeSeries> {
        throw new Error('Unsupported feature!')
    }

    public remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Builds the date in YYYY-MM-DD format if it is 'today'.
     *
     * @param date Date used to construct the final date.
     * @return {string}
     */
    private buildDate(date: string): string {
        return date === 'today' ? this.generateDate() : date
    }

    private generateDate(): string {
        const date = new Date()
        const year = String(date.getFullYear())
        let month = String(date.getMonth() + 1)
        let day = String(date.getDate())

        if (month.length === 1) month = month.padStart(2, '0')
        if (day.length === 1) day = day.padStart(2, '0')

        return [year, month, day].join('-')
    }
}
