import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { Identifier } from '../../../di/identifiers'
import { inject } from 'inversify'
import { ILogger } from '../../../utils/custom.logger'
import { ITimeSeriesRepository } from '../../port/timeseries.repository.interface'
import { TimeSeriesSyncEvent } from '../event/time.series.sync.event'
import { TimeSeries } from '../../domain/model/time.series'
import { TimeSeriesSyncValidator } from '../../domain/validator/time.series.sync.validator'

export class TimeSeriesSyncEventHandler implements IIntegrationEventHandler<TimeSeriesSyncEvent> {

    constructor(
        @inject(Identifier.TIMESERIES_REPOSITORY) public readonly _timeSeriesRepository: ITimeSeriesRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: TimeSeriesSyncEvent): Promise<void> {
        try {
            const timeSeries: TimeSeries = new TimeSeries().fromJSON(event.timeseries)
            TimeSeriesSyncValidator.validate(timeSeries)

            await this._timeSeriesRepository.create(timeSeries)
            this._logger.info(`Action for event ${event.event_name} and user id ${timeSeries.patientId} executed successfully!`)
        } catch (err: any) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`to perform the operation with the event: ${JSON.stringify(event)}. Error: ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
