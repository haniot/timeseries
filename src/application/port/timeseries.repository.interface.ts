import { TimeSeries } from '../domain/model/time.series'
import { IRepository } from './repository.interface'
import { TimeSeriesGroup } from '../domain/model/time.series.group'

/**
 * TimeSeries repository interface.
 *
 * @extends {IRepository}
 */
export interface ITimeSeriesRepository extends IRepository<TimeSeries> {
    /**
     * Retrieve the time series of all supported features associated with a patient except heart rate.
     * Available resources: steps, calories, distance, active_minutes.
     *
     * @param patientId
     * @param startDate
     * @param endDate
     * @return {Promise<TimeSeriesGroup>}
     * @throws {ValidationException | RepositoryException}
     */
    listAll(patientId: string, startDate: string, endDate: string): Promise<TimeSeriesGroup>

    /**
     * Retrieves the time series of a resource associated with a patient.
     *
     * @param patientId
     * @param type
     * @param startDate
     * @param endDate
     * @return {Promise<TimeSeries>}
     * @throws {ValidationException | RepositoryException}
     */
    listByType(patientId: string, type: string, startDate: string, endDate: string): Promise<TimeSeries>
}
