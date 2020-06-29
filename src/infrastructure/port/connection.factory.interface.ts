export interface IConnectionFactory {
    createConnection(uri: string | IDBConfig, options?: IDBOptions | IEventBusOptions): Promise<any>
}

export interface IDBConfig {
    host: string
    port: number
    database: string
    username: string
    password: string
    protocol: string
}

export interface IDBOptions {
    ssl?: ISSL
}

export interface IEventBusOptions {
    retries?: number
    interval?: number
    sslOptions?: ISSL
}

export interface ISSL {
    cert?: Buffer
    key?: Buffer
    ca?: Buffer[]
}
