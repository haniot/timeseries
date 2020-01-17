import { IConnectionFactory, IDBOptions } from '../../src/infrastructure/port/connection.factory.interface'

export class ConnectionFactoryInfluxDBMock implements IConnectionFactory {
    public simulateFailure: boolean = false

    public createConnection(uri: string, options?: IDBOptions): Promise<any> {
        return !this.simulateFailure ? Promise.resolve({}) : Promise.reject(new Error(`connect ECONNREFUSED ${uri}`))
    }
}
