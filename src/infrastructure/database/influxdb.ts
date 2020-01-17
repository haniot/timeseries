import { inject, injectable } from 'inversify'
import { IConnectionFactory, IDBOptions } from '../port/connection.factory.interface'
import { Identifier } from '../../di/identifiers'
import { IDatabase } from '../port/database.interface'
import { ILogger } from '../../utils/custom.logger'
import { EventEmitter } from 'events'
import { InfluxDB } from 'influx'

/**
 * Implementation of the interface that provides connection with InfluxDB.
 *
 * @see {@link https://www.influxdata.com/} for more details.
 * @implements {IDatabase}
 */
@injectable()
export class MyInfluxDB implements IDatabase {
    private _connection?: InfluxDB

    private readonly _eventConnection: EventEmitter

    constructor(
        @inject(Identifier.INFLUXDB_CONNECTION_FACTORY) private readonly _connectionFactory: IConnectionFactory,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this._eventConnection = new EventEmitter()
    }

    get eventConnection(): EventEmitter {
        return this._eventConnection
    }

    get connection(): InfluxDB | undefined {
        return this._connection
    }

    /**
     * Connect InfluxDB.
     *
     * @param uri This specification defines an URI scheme.
     * @param options {IDBOptions} Connection setup Options.
     * @return {Promise<void>}
     */
    public async connect(uri: string, options?: IDBOptions): Promise<void> {
        const _this = this
        await this._connectionFactory.createConnection(uri, options)
            .then((connection: InfluxDB) => {
                this._connection = connection
                this._eventConnection.emit('connected')
                this._logger.info('Connection established with InfluxDB...')
            })
            .catch((err) => {
                this._connection = undefined
                this._eventConnection.emit('disconnected')
                this._logger.warn(`Error trying to connect for the first time with InfluxDB: ${err.message}`)
                setTimeout(async () => {
                    _this.connect(uri, options).then()
                }, 2000)
            })
    }

    /**
     * Releases the resources.
     *
     * @return {Promise<void>}
     */
    public async dispose(): Promise<void> {
        this._connection = undefined
    }
}
