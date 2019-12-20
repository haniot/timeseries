import { IntradayTimeSeries } from '../domain/model/intraday.time.series'
import { IRepository } from './repository.interface'

/**
 * TimeSeries repository interface.
 *
 * @extends {IRepository}
 */
export interface IIntradayTimeSeriesRepository extends IRepository<IntradayTimeSeries> {
    /**
     * Retrieves the intraday time series of a resource associated with a patient.
     * Note: It goes from 00:00:00 to 23:59:59. Or, until the current time if the date is the current day.
     *
     * @param patientId
     * @param type
     * @param date
     * @param interval
     * @return {Promise<IntradayTimeSeries>}
     * @throws {ValidationException | RepositoryException}
     */
    listByInterval(patientId: string, type: string, date: string, interval: string): Promise<IntradayTimeSeries>

    /**
     * Retrieves the intraday time series of a resource associated with a patient.
     *
     * @param patientId
     * @param type
     * @param startDate
     * @param endDate
     * @param startTime
     * @param endTime
     * @param interval
     * @return {Promise<IntradayTimeSeries>}
     * @throws {ValidationException | RepositoryException}
     */
    listByIntervalAndTime(patientId: string, type: string,
                          startDate: string, endDate: string,
                          startTime: string, endTime: string,
                          interval: string): Promise<IntradayTimeSeries>
}
