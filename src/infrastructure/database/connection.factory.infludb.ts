import { injectable } from 'inversify'
import { IConnectionFactory, IDBOptions } from '../port/connection.factory.interface'
import { InfluxDB } from 'influx'
import * as url from 'url'
import { Default } from '../../utils/default'

@injectable()
export class ConnectionFactoryInfluxDB implements IConnectionFactory {
    /**
     * Create instance of InfluxDB.
     *
     * @param uri This specification defines an URI scheme.
     * @param options {IDBOptions} Connection setup Options.
     * @return Promise<Connection>
     */
    public createConnection(uri: string, options?: IDBOptions): Promise<InfluxDB> {
        return new Promise<InfluxDB>((resolve, reject) => {
            const influx = new InfluxDB(uri)
            const dbName = url.parse(uri).pathname?.replace(new RegExp('\/', 'g'), '') || Default.APP_ID

            influx.getDatabaseNames()
                .then(names => {
                    if (!names.includes(dbName)) {
                        return influx.createDatabase(dbName)
                    }
                })
                .then(() => resolve(influx))
                .catch(err => reject(err))
        })
    }
}
