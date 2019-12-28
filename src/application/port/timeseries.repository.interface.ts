import { TimeSeries } from '../domain/model/time.series'
import { IRepository } from './repository.interface'

/**
 * TimeSeries repository interface.
 *
 * @extends {IRepository}
 */
export interface ITimeSeriesRepository extends IRepository<TimeSeries> {
    /**
     * Retrieves the time series of a resource associated with a patient.
     *
     * @param patientId
     * @param startDate
     * @param endDate
     * @param type
     * @return {Promise<TimeSeries>}
     * @throws {ValidationException | RepositoryException}
     */
    listByType(patientId: string, startDate: string, endDate: string, type: string): Promise<TimeSeries>
}
