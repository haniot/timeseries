import { IDisposable } from './disposable.interface'
import { EventEmitter } from 'events'
import { IDBOptions } from './connection.factory.interface'
import { InfluxDB } from 'influx'

export interface IDatabase extends IDisposable {
    connection: InfluxDB | undefined

    eventConnection: EventEmitter

    connect(uri: string, options?: IDBOptions): Promise<void>
}
