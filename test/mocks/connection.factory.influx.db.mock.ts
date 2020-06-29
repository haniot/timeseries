import { IConnectionFactory, IDBConfig, IDBOptions } from '../../src/infrastructure/port/connection.factory.interface'

export class ConnectionFactoryInfluxDBMock implements IConnectionFactory {
    public simulateFailure: boolean = false

    public createConnection(config: IDBConfig, options?: IDBOptions): Promise<any> {
        return !this.simulateFailure ? Promise.resolve({}) : Promise.reject(new Error(`connect ECONNREFUSED ${config.host}`))
    }
}
