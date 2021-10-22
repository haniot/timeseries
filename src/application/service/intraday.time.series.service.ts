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
import { TimeSeriesType } from '../domain/utils/time.series.type'

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
            // Constructs date and interval in the appropriate format.
            date = this.buildDate(date)
            interval = this.buildInterval(interval, type)

            // Validates params.
            ObjectIdValidator.validate(patientId)
            ResourceTypeValidator.validate(type)
            DateValidator.validate(date)
            IntervalValidator.validate(interval)

            // Calls the repository.
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
            // Constructs dates and interval in the appropriate format.
            startDate = this.buildDate(startDate)
            endDate = this.buildDate(endDate)
            interval = this.buildInterval(interval, type)

            // Validates params.
            IntradayListTimeValidator.validate(patientId, type, startDate, endDate, startTime, endTime, interval)

            // Calls the repository.
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
        throw new Error('Unsupported feature!')
    }

    public remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    /**
     * Builds the interval according to the type of resource, and converts from hours to minutes if necessary.
     *
     * @param interval Interval used to construct the final interval.
     * @param type Resource type.
     * @return {string}
     */
    private buildInterval(interval: string, type: string): string {
        if (type === TimeSeriesType.HEART_RATE) return this.checkConvertHours(interval)

        interval = this.checkConvertHours(interval)
        return this.checkConvertSeconds(interval)
    }

    /**
     * Checks whether the interval is in hours and converts it to minutes.
     *
     * @param interval Interval used to return the final interval.
     * @return {string}
     */
    private checkConvertHours(interval: string): string {
        if ((/^[1-9][0-9]*h$/).test(interval)) {
            const intervalNumber = Number(interval.substring(0, interval.indexOf('h')))
            interval = (intervalNumber * 60) + 'm'
        }
        return interval
    }

    /**
     * Checks whether the interval is in seconds and converts it to minutes.
     *
     * @param interval Interval used to return the final interval.
     * @return {string}
     */
    private checkConvertSeconds(interval: string): string {
        if ((/^[1-9][0-9]*s$/).test(interval)) interval = interval.replace('s', 'm')
        return interval
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
