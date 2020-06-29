import { IDisposable } from './disposable.interface'
import { EventEmitter } from 'events'
import { IDBConfig, IDBOptions } from './connection.factory.interface'
import { InfluxDB } from 'influx'

export interface IDatabase extends IDisposable {
    connection: InfluxDB | undefined

    eventConnection: EventEmitter

    tryConnect(uri: string | IDBConfig, options?: IDBOptions): Promise<void>
}
