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
        @inject(Identifier.RPC_SERVER_EVENT_BUS_TASK) private readonly _rpcServerTask: IBackgroundTask,
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
            this._startTasks()
        } catch (err: any) {
            return Promise.reject(new Error(`Error initializing services in background! ${err.message}`))
        }
    }

    public async stopServices(): Promise<void> {
        try {
            await this._influxdb.dispose()

            await this._eventBus.dispose()
        } catch (err: any) {
            return Promise.reject(new Error(`Error stopping background services! ${err.message}`))
        }
    }

    /**
     * Open RabbitMQ connection and perform tasks
     */
    private _startTasks(): void {
        const rabbitConfigs = Config.getRabbitConfig()
        this._eventBus
            .connectionSub
            .open(rabbitConfigs.uri, rabbitConfigs.options)
            .then((conn) => {
                this._logger.info('Connection with subscribe event opened successful!')

                conn.on('disconnected', () => this._logger.warn('Connection with subscribe event has been lost...'))
                conn.on('reestablished', () => this._logger.info('Connection with subscribe event re-established!'))

                this._subscribeTask.run()
            })
            .catch(err => {
                this._logger.error(`Error trying to get connection to Event Bus for event subscribing. ${err.message}`)
            })

        this._eventBus
            .connectionRpcServer
            .open(rabbitConfigs.uri, rabbitConfigs.options)
            .then((conn) => {
                this._logger.info('Connection with RPC Server opened successful!')

                conn.on('disconnected', () => this._logger.warn('Connection with RPC Server has been lost...'))
                conn.on('reestablished', () => this._logger.info('Connection with RPC Server re-established!'))

                this._rpcServerTask.run()
            })
            .catch(err => {
                this._logger.error(`Error trying to get connection to Event Bus for RPC Server. ${err.message}`)
            })
    }
}
