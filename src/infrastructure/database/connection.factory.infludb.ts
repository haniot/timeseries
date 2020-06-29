import { injectable } from 'inversify'
import { IConnectionFactory, IDBConfig, IDBOptions } from '../port/connection.factory.interface'
import { InfluxDB, ISingleHostConfig } from 'influx'

@injectable()
export class ConnectionFactoryInfluxDB implements IConnectionFactory {
    /**
     * Create instance of InfluxDB.
     *
     * @param config {IDBConfig} This database configuration
     * @param options {IDBOptions} Connection setup Options.
     * @return Promise<Connection>
     */
    public createConnection(config: IDBConfig, options?: IDBOptions): Promise<InfluxDB> {
        return new Promise<InfluxDB>((resolve, reject) => {
            const influx = new InfluxDB(({ ...config, options: options?.ssl }) as ISingleHostConfig)

            influx.getDatabaseNames()
                .then(names => {
                    if (!names.includes(config.database)) {
                        return influx.createDatabase(config.database)
                    }
                })
                .then(() => resolve(influx))
                .catch(err => reject(err))
        })
    }
}
