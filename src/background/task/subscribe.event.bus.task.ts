import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { UserDeleteEvent } from '../../application/integration-event/event/user.delete.event'
import { UserDeleteEventHandler } from '../../application/integration-event/handler/user.delete.event.handler'
import { DIContainer } from '../../di/di'
import { TimeSeriesSyncEvent } from '../../application/integration-event/event/time.series.sync.event'
import { TimeSeriesSyncEventHandler } from '../../application/integration-event/handler/time.series.sync.event.handler'
import { IntradayTimeSeriesSyncEvent } from '../../application/integration-event/event/intraday.time.series.sync.event'
import { IntradayTimeSeriesSyncEventHandler } from '../../application/integration-event/handler/intraday.time.series.sync.event.handler'

@injectable()
export class SubscribeEventBusTask implements IBackgroundTask {
    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public run(): void {
        this.initializeSubscribe()
    }

    public async stop(): Promise<void> {
        try {
            await this._eventBus.dispose()
        } catch (err: any) {
            return Promise.reject(new Error(`Error stopping SubscribeEventBusTask! ${err.message}`))
        }
    }

    /**
     * Subscribe for all events.
     */
    private initializeSubscribe(): void {
        try {
            // Subscribe in UserDeleteEvent
            this._eventBus
                .subscribe(
                    new UserDeleteEvent(),
                    new UserDeleteEventHandler(DIContainer.get(Identifier.INTRADAY_REPOSITORY), this._logger),
                    UserDeleteEvent.ROUTING_KEY
                )
                .then((result: boolean) => {
                    if (result) this._logger.info('Subscribe in UserDeleteEvent successful!')
                })
                .catch(err => {
                    this._logger.error(`Error in Subscribe UserDeleteEvent! ${err.message}`)
                })

            // Subscribe in TimeSeriesSyncEvent
            this._eventBus
                .subscribe(
                    new TimeSeriesSyncEvent(),
                    new TimeSeriesSyncEventHandler(DIContainer.get(Identifier.TIMESERIES_REPOSITORY), this._logger),
                    TimeSeriesSyncEvent.ROUTING_KEY
                )
                .then((result: boolean) => {
                    if (result) this._logger.info('Subscribe in TimeSeriesSyncEvent successful!')
                })
                .catch(err => {
                    this._logger.error(`Error in Subscribe TimeSeriesSyncEvent! ${err.message}`)
                })

            // Subscribe in TimeSeriesSyncEvent
            this._eventBus
                .subscribe(
                    new IntradayTimeSeriesSyncEvent(),
                    new IntradayTimeSeriesSyncEventHandler(DIContainer.get(Identifier.INTRADAY_REPOSITORY), this._logger),
                    IntradayTimeSeriesSyncEvent.ROUTING_KEY
                )
                .then((result: boolean) => {
                    if (result) this._logger.info('Subscribe in IntradayTimeSeriesSyncEvent successful!')
                })
                .catch(err => {
                    this._logger.error(`Error in Subscribe IntradayTimeSeriesSyncEvent! ${err.message}`)
                })
        } catch (err: any) {
            this._logger.error(`An error occurred while subscribing to events. ${err.message}`)
        }
    }
}
