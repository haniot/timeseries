import fs from 'fs'
import { Default } from './default'
import { IDBConfig, IDBOptions, IEventBusOptions, ISSL } from '../infrastructure/port/connection.factory.interface'

export abstract class Config {

    /**
     * Retrieve the URI and options for connection to InfluxDB.
     *
     * @return {
     *     host: '',
     *     port: 8086,
     *     database: '',
     *     username: '',
     *     password: '',
     *     protocol: 'http | https',
     *     options: {
     *        ssl: {
     *           cert: '',
     *           key: '',
     *           ca: ''
     *        }
     *     }
     * }
     */
    public static getInfluxConfig(): IInfluxDBConfig {
        return {
            host: process.env.INFLUXDB_HOST || Default.INFLUXDB_HOST,
            port: process.env.INFLUXDB_PORT || Default.INFLUXDB_PORT,
            database: (process.env.NODE_ENV === 'test') ? (process.env.INFLUXDB_NAME_TEST ||
                Default.INFLUXDB_NAME_TEST) : (process.env.INFLUXDB_NAME || Default.INFLUXDB_NAME),
            username: process.env.INFLUXDB_USER,
            password: process.env.INFLUXDB_PASS,
            protocol: process.env.INFLUXDB_PROTOCOL || Default.INFLUXDB_PROTOCOL,
            options: {
                ssl: (process.env.INFLUXDB_PROTOCOL || Default.INFLUXDB_PROTOCOL) === 'http' ? undefined : {
                    cert: fs.readFileSync(process.env.INFLUXDB_CERT_PATH!),
                    key: fs.readFileSync(process.env.INFLUXDB_KEY_PATH!),
                    ca: [fs.readFileSync(process.env.INFLUXDB_CA_PATH!)]
                } as ISSL
            }
        } as IInfluxDBConfig
    }

    /**
     * Retrieve the URI and options for connection to RabbitMQ.
     *
     * @return {
     *     uri: '',
     *     options: {
     *         retries: 0,
     *         interval: 2000,
     *         sslOptions: {
     *             cert: '',
     *             key: '',
     *             ca: [''],
     *         }
     *     }
     * }
     */
    public static getRabbitConfig(): IRabbitConfig {
        const uri = process.env.RABBITMQ_URI || Default.RABBITMQ_URI
        return {
            uri,
            options: {
                retries: 0,
                interval: 2000,
                sslOptions: uri.indexOf('amqps') !== 0 ? undefined : {
                    cert: fs.readFileSync(process.env.RABBITMQ_CERT_PATH!),
                    key: fs.readFileSync(process.env.RABBITMQ_KEY_PATH!),
                    ca: [fs.readFileSync(process.env.RABBITMQ_CA_PATH!)]
                } as ISSL
            } as IEventBusOptions
        } as IRabbitConfig
    }
}

interface IInfluxDBConfig extends IDBConfig {
    options: IDBOptions
}

interface IRabbitConfig {
    uri: string
    options: IEventBusOptions
}

