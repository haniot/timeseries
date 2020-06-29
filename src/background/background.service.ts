import { Config } from '../utils/config'
import { inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { ILogger } from '../utils/custom.logger'
import { IDatabase } from '../infrastructure/port/database.interface'
import { IBackgroundTask } from '../application/port/background.task.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'

@injectable()
export class BackgroundService {
    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.INFLUXDB_CONNECTION) private readonly _influxdb: IDatabase,
        @inject(Identifier.SUBSCRIBE_EVENT_BUS_TASK) private readonly _subscribeTask: IBackgroundTask,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async startServices(): Promise<void> {
        try {
            /**
             * Trying to connect to InfluxDB.
             * Go ahead only when the run is resolved.
             */
            const dbConfigs = Config.getInfluxConfig()
            await this._influxdb.tryConnect(dbConfigs, dbConfigs.options)

            // Open RabbitMQ connection and perform tasks
            this._eventBus.enableLogger()
            this.startTasks()
        } catch (err) {
            return Promise.reject(new Error(`Error initializing services in background! ${err.message}`))
        }
    }

    public async stopServices(): Promise<void> {
        try {
            await this._influxdb.dispose()
        } catch (err) {
            return Promise.reject(new Error(`Error stopping background services! ${err.message}`))
        }
    }

    /**
     * Open RabbitMQ connection and perform tasks
     */
    private startTasks(): void {
        const rabbitConfigs = Config.getRabbitConfig()
        this._eventBus
            .connectionSub
            .open(rabbitConfigs.uri, rabbitConfigs.options)
            .then(() => {
                this._logger.info('Connection with subscribe event opened successful!')
                this._subscribeTask.run()
            })
            .catch(err => {
                this._logger.error(`Error trying to get connection to Event Bus for event subscribing. ${err.message}`)
            })
    }
}
