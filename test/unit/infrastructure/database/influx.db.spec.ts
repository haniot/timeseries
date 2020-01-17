import { assert } from 'chai'
import { ConnectionFactoryInfluxDBMock } from '../../../mocks/connection.factory.influx.db.mock'
import { MyInfluxDB } from '../../../../src/infrastructure/database/influxdb'
import { CustomLoggerMock } from '../../../mocks/custom.logger.mock'
import { EventEmitter } from 'events'

describe('INFRASTRUCTURE: InfluxDB', () => {
    const connectionFactoryMock = new ConnectionFactoryInfluxDBMock()
    const loggerMoc = new CustomLoggerMock()

    context('Connection.', () => {
        it('should return Connection instance.', async () => {
            const influxDB = new MyInfluxDB(connectionFactoryMock, loggerMoc)
            await influxDB.connect('http://127.0.0.1:8086/db.test')
            assert.notEqual(influxDB.connection, undefined)
        })

        it('should return undefined connection instance for invalid URI or server unavailable.', (done) => {
            const connFactory = new ConnectionFactoryInfluxDBMock()
            connFactory.simulateFailure = true
            const influxDB = new MyInfluxDB(connFactory, loggerMoc)
            influxDB
                .connect('127.0.0.1:5000')
                .then(() => {
                    assert.equal(influxDB.connection, undefined)
                    done()
                })
                .catch(done)
        })

        it('return an undefined connection instance after calling the dispose() function.', async () => {
            const influxDB = new MyInfluxDB(connectionFactoryMock, loggerMoc)
            await influxDB.connect('http://127.0.0.1:8086/db.test')
            assert.notEqual(influxDB.connection, undefined) // connection ok

            await influxDB.dispose() // connection destroy
            assert.equal(influxDB.connection, undefined)
        })
    })

    context('EventEmitter.', () => {
        it('should return instance EventEmitter when calling function eventConnection.', () => {
            const influxDB = new MyInfluxDB(connectionFactoryMock, loggerMoc)
            assert.instanceOf(influxDB.eventConnection, EventEmitter)
        })

        it('should call the callback triggered by the "connected" event.', (done) => {
            const influxDB = new MyInfluxDB(connectionFactoryMock, loggerMoc)
            influxDB.eventConnection.on('connected', done)
            influxDB.connect('http://127.0.0.1:8086/db.test').catch(done)
        })
    })
})
