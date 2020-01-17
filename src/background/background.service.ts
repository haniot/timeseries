import { inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { IDatabase } from '../infrastructure/port/database.interface'
import { Default } from '../utils/default'
import { IBackgroundTask } from '../application/port/background.task.interface'

@injectable()
export class BackgroundService {
    constructor(
        @inject(Identifier.INFLUXDB_CONNECTION) private readonly _influxdb: IDatabase,
        @inject(Identifier.SUBSCRIBE_EVENT_BUS_TASK) private readonly _subscribeTask: IBackgroundTask,
    ) {
    }

    public async startServices(): Promise<void> {
        try {
            await this._influxdb.connect(this.getDBUri())
            await this._subscribeTask.run()
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
     * Retrieve the URI for connection to MongoDB.
     *
     * @return {string}
     */
    private getDBUri(): string {
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
            return process.env.INFLUXDB_URI_TEST || Default.INFLUXDB_URI_TEST
        }
        return process.env.INFLUXDB_URI || Default.INFLUXDB_URI
    }
}
