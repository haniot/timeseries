import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { UserDeleteEvent } from '../event/user.delete.event'
import { Identifier } from '../../../di/identifiers'
import { IIntradayTimeSeriesRepository } from '../../port/intraday.time.series.repository.interface'
import { inject } from 'inversify'
import { User } from '../../domain/model/user'
import { UserValidator } from '../../domain/validator/user.validator'
import { ILogger } from '../../../utils/custom.logger'

export class UserDeleteEventHandler implements IIntegrationEventHandler<UserDeleteEvent> {

    constructor(
        @inject(Identifier.INTRADAY_REPOSITORY) public readonly _intradayRepository: IIntradayTimeSeriesRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: UserDeleteEvent): Promise<void> {
        try {
            const user: User = new User().fromJSON(event.user)
            UserValidator.validate(user)

            await this._intradayRepository.delete(user.id!)
            this._logger.info(`Action for event ${event.event_name} and user id ${user.id} executed successfully!`)
        } catch (err: any) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`to perform the operation with the event: ${JSON.stringify(event)}. Error: ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
