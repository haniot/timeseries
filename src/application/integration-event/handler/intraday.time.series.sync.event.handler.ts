import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { Identifier } from '../../../di/identifiers'
import { inject } from 'inversify'
import { ILogger } from '../../../utils/custom.logger'
import { IntradayTimeSeries } from '../../domain/model/intraday.time.series'
import { IntradayTimeSeriesSyncEvent } from '../event/intraday.time.series.sync.event'
import { IIntradayTimeSeriesRepository } from '../../port/intraday.time.series.repository.interface'
import { IntradayTimeSeriesSyncValidator } from '../../domain/validator/intraday.time.series.sync.validator'

export class IntradayTimeSeriesSyncEventHandler implements IIntegrationEventHandler<IntradayTimeSeriesSyncEvent> {

    constructor(
        @inject(Identifier.INTRADAY_REPOSITORY) public readonly _intradayRepository: IIntradayTimeSeriesRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: IntradayTimeSeriesSyncEvent): Promise<void> {
        try {
            const intradayTimeSeries: IntradayTimeSeries = new IntradayTimeSeries().fromJSON(event.intraday)
            IntradayTimeSeriesSyncValidator.validate(intradayTimeSeries)

            await this._intradayRepository.create(intradayTimeSeries)
            this._logger.info(`Action for event ${event.event_name} and user id ${intradayTimeSeries.patientId} executed successfully!`)
        } catch (err) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`to perform the operation with the event: ${JSON.stringify(event)}. Error: ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
