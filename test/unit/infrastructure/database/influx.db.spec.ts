import { assert } from 'chai'
import { ConnectionFactoryInfluxDBMock } from '../../../mocks/connection.factory.influx.db.mock'
import { ConnectionInfluxDB } from '../../../../src/infrastructure/database/connection.influxdb'
import { CustomLoggerMock } from '../../../mocks/custom.logger.mock'
import { EventEmitter } from 'events'
import { IDBConfig } from '../../../../src/infrastructure/port/connection.factory.interface'

describe('INFRASTRUCTURE: InfluxDB', () => {
    const connectionFactoryMock = new ConnectionFactoryInfluxDBMock()
    const loggerMoc = new CustomLoggerMock()

    context('Connection.', () => {
        it('should return Connection instance.', async () => {
            const influxDB = new ConnectionInfluxDB(connectionFactoryMock, loggerMoc)
            await influxDB.tryConnect({ host: 'localhost' } as IDBConfig)
            assert.notEqual(influxDB.connection, undefined)
        })

        it('should return undefined connection instance for invalid URI or server unavailable.', (done) => {
            const connFactory = new ConnectionFactoryInfluxDBMock()
            connFactory.simulateFailure = true
            const influxDB = new ConnectionInfluxDB(connFactory, loggerMoc)
            influxDB
                .tryConnect({ host: 'localhost' } as IDBConfig)
                .then(() => {
                    assert.equal(influxDB.connection, undefined)
                    done()
                })
                .catch(done)
        })

        it('return an undefined connection instance after calling the dispose() function.', async () => {
            const influxDB = new ConnectionInfluxDB(connectionFactoryMock, loggerMoc)
            await influxDB.tryConnect({ host: 'localhost' } as IDBConfig)
            assert.notEqual(influxDB.connection, undefined) // connection ok

            await influxDB.dispose() // connection destroy
            assert.equal(influxDB.connection, undefined)
        })
    })

    context('EventEmitter.', () => {
        it('should return instance EventEmitter when calling function eventConnection.', () => {
            const influxDB = new ConnectionInfluxDB(connectionFactoryMock, loggerMoc)
            assert.instanceOf(influxDB.eventConnection, EventEmitter)
        })

        it('should call the callback triggered by the "connected" event.', (done) => {
            const influxDB = new ConnectionInfluxDB(connectionFactoryMock, loggerMoc)
            influxDB.eventConnection.on('connected', done)
            influxDB.tryConnect({ host: 'localhost' } as IDBConfig).catch(done)
        })
    })
})
