import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
import { Default } from '../../../src/utils/default'
import { Config } from '../../../src/utils/config'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IntradayTimeSeries } from '../../../src/application/domain/model/intraday.time.series'
import { IntradayTimeSeriesMock } from '../../mocks/intraday.time.series.mock'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'
import { IIntradayTimeSeriesRepository } from '../../../src/application/port/intraday.time.series.repository.interface'
import { Strings } from '../../../src/utils/strings'

const db: IDatabase = DIContainer.get(Identifier.INFLUXDB_CONNECTION)
const rabbit: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const rpcServerEventBusTask: IBackgroundTask = DIContainer.get(Identifier.RPC_SERVER_EVENT_BUS_TASK)

describe('RPC SERVER EVENT BUS TASK', () => {
    // Timeout function for control of execution
    const timeout = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    // Starts DB connection and deletes all TimeSeries, starts RabbitMQ connection and RpcServerEventBusTask.
    before(async () => {
        try {
            const dbConfigs = Config.getInfluxConfig()
            await db.tryConnect(dbConfigs, dbConfigs.options)

            await deleteAll()

            const rabbitConfigs = Config.getRabbitConfig()
            await rabbit.connectionRpcServer.open(rabbitConfigs.uri, rabbitConfigs.options)
            await rabbit.connectionRpcClient.open(rabbitConfigs.uri, rabbitConfigs.options)

            rpcServerEventBusTask.run()

            await timeout(5000)
        } catch (err) {
            throw new Error('Failure on RpcServerEventBusTask test: ' + err.message)
        }
    })

    // Deletes all TimeSeries, stops DB connection and RpcServerEventBusTask.
    after(async () => {
        try {
            await deleteAll()

            await db.dispose()

            await rpcServerEventBusTask.stop()
        } catch (err) {
            throw new Error('Failure on RpcServerEventBusTask test: ' + err.message)
        }
    })

    /**
     * PROVIDERS
     */
    describe('Provider IntradayTimeSeries', () => {
        context('when successfully retrieving time series of 1s when there is at least one time series ' +
            'corresponding to the parameters', () => {
            const startTime = '2020-10-01T00:00:00'
            const endTime = '2020-10-01T23:59:59'
            const intradaySteps: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.STEPS)
            intradaySteps.patientId = '4a62be07d6f33400146c9b62'
            const intradayCalories: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.CALORIES)
            intradayCalories.patientId = '4a62be07d6f33400146c9b62'
            const intradayDistance: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.DISTANCE)
            intradayDistance.patientId = '4a62be07d6f33400146c9b62'
            const intradayActiveMinutes: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.ACTIVE_MINUTES)
            intradayActiveMinutes.patientId = '4a62be07d6f33400146c9b62'
            // The minimum interval of heart_rate is one second, the other resources is one minute.
            const intradayHeartRate: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1s', TimeSeriesType.HEART_RATE)
            intradayHeartRate.patientId = '4a62be07d6f33400146c9b62'

            before(async () => {
                try {
                    await deleteAll()

                    await addIntradayTimeSeries(intradaySteps)
                    await addIntradayTimeSeries(intradayCalories)
                    await addIntradayTimeSeries(intradayDistance)
                    await addIntradayTimeSeries(intradayActiveMinutes)
                    await addIntradayTimeSeries(intradayHeartRate)
                } catch (err) {
                    throw new Error('Failure on Provider IntradayTimeSeries test: ' + err.message)
                }
            })

            // Delete all timeseries from database after test case.
            after(async () => {
                try {
                    await deleteAll()
                } catch (err) {
                    throw new Error('Failure on Provider IntradayTimeSeries test: ' + err.message)
                }
            })

            it('should return a time series of 1s from the steps resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.STEPS,
                    '2020-10-01', '2020-10-01',
                    '10:00', '10:50',
                    '1s')
                    .then(result => {
                        expect(result.data_set.length).to.equal(51)
                        expect(result.data_set[0]).to.deep.equal(
                            intradaySteps.toJSON().data_set.find(el => el.time === '10:00:00')
                        )
                        expect(result.data_set[result.data_set.length - 1]).to.deep.equal(
                            intradaySteps.toJSON().data_set.find(el => el.time === '10:50:00')
                        )
                        done()
                    })
                    .catch(done)
            })

            it('should return a time series of 1s from the calories resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.CALORIES,
                    '2020-10-01', '2020-10-01',
                    '00:00:00', '23:59:59',
                    '1s')
                    .then(result => {
                        intradayCalories.summary.endTime = '2020-10-01T23:59:00'
                        expect(result).to.deep.equal(intradayCalories.toJSON())
                        done()
                    })
                    .catch(done)
            })

            it('should return a time series of 1s from the distance resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.DISTANCE,
                    '2020-10-01', '2020-10-01',
                    '07:05', '07:40:15',
                    '1s')
                    .then(result => {
                        expect(result.data_set.length).to.equal(36)
                        expect(result.data_set[0]).to.deep.equal(
                            intradayDistance.toJSON().data_set.find(el => el.time === '07:05:00')
                        )
                        expect(result.data_set[result.data_set.length - 1]).to.deep.equal(
                            intradayDistance.toJSON().data_set.find(el => el.time === '07:40:00')
                        )
                        done()
                    })
                    .catch(done)
            })

            it('should return a time series of 1s from the active_minutes resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.ACTIVE_MINUTES,
                    '2020-10-01', '2020-10-01',
                    '00:00', '23:59:59',
                    '1s')
                    .then(result => {
                        intradayActiveMinutes.summary.endTime = '2020-10-01T23:59:00'
                        expect(result).to.deep.equal(intradayActiveMinutes.toJSON())
                        done()
                    })
                    .catch(done)
            })

            it('should return a time series of 1s from the heart_rate resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.HEART_RATE,
                    '2020-10-01', '2020-10-01',
                    '10:00:00', '12:00:00',
                    '1s')
                    .then(result => {
                        expect(result.data_set.length).to.equal(7201)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when successfully retrieving time series of 10m when there is at least one time series ' +
            'corresponding to the parameters', () => {
            const startTime = '2020-10-01T00:00:00'
            const endTime = '2020-10-01T23:59:59'
            const intradaySteps: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '10m', TimeSeriesType.STEPS)
            intradaySteps.patientId = '4a62be07d6f33400146c9b62'
            const intradayCalories: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '10m', TimeSeriesType.CALORIES)
            intradayCalories.patientId = '4a62be07d6f33400146c9b62'
            const intradayDistance: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '10m', TimeSeriesType.DISTANCE)
            intradayDistance.patientId = '4a62be07d6f33400146c9b62'
            const intradayActiveMinutes: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '10m', TimeSeriesType.ACTIVE_MINUTES)
            intradayActiveMinutes.patientId = '4a62be07d6f33400146c9b62'
            // The minimum interval of heart_rate is one second, the other resources is one minute.
            const intradayHeartRate: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '10m', TimeSeriesType.HEART_RATE)
            intradayHeartRate.patientId = '4a62be07d6f33400146c9b62'

            before(async () => {
                try {
                    await deleteAll()

                    await addIntradayTimeSeries(intradaySteps)
                    await addIntradayTimeSeries(intradayCalories)
                    await addIntradayTimeSeries(intradayDistance)
                    await addIntradayTimeSeries(intradayActiveMinutes)
                    await addIntradayTimeSeries(intradayHeartRate)
                } catch (err) {
                    throw new Error('Failure on Provider IntradayTimeSeries test: ' + err.message)
                }
            })

            // Delete all timeseries from database after test case.
            after(async () => {
                try {
                    await deleteAll()
                } catch (err) {
                    throw new Error('Failure on Provider IntradayTimeSeries test: ' + err.message)
                }
            })

            it('should return a time series of 10m from the steps resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.STEPS,
                    '2020-10-01', '2020-10-01',
                    '10:00', '10:50',
                    '10m')
                    .then(result => {
                        expect(result.data_set.length).to.equal(6)
                        expect(result.data_set[0]).to.deep.equal(
                            intradaySteps.toJSON().data_set.find(el => el.time === '10:00:00')
                        )
                        expect(result.data_set[result.data_set.length - 1]).to.deep.equal(
                            intradaySteps.toJSON().data_set.find(el => el.time === '10:50:00')
                        )
                        done()
                    })
                    .catch(done)
            })

            it('should return a time series of 10m from the calories resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.CALORIES,
                    '2020-10-01', '2020-10-01',
                    '00:00:00', '23:59:59',
                    '10m')
                    .then(result => {
                        intradayCalories.summary.endTime = '2020-10-01T23:50:00'
                        expect(result).to.deep.equal(intradayCalories.toJSON())
                        done()
                    })
                    .catch(done)
            })

            it('should return a time series of 10m from the distance resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.DISTANCE,
                    '2020-10-01', '2020-10-01',
                    '07:05', '07:40:15',
                    '10m')
                    .then(result => {
                        expect(result.data_set.length).to.equal(4)
                        done()
                    })
                    .catch(done)
            })

            it('should return a time series of 10m from the active_minutes resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.ACTIVE_MINUTES,
                    '2020-10-01', '2020-10-01',
                    '00:00', '23:59:59',
                    '10m')
                    .then(result => {
                        intradayActiveMinutes.summary.endTime = '2020-10-01T23:50:00'
                        expect(result).to.deep.equal(intradayActiveMinutes.toJSON())
                        done()
                    })
                    .catch(done)
            })

            it('should return a time series of 10m from the heart_rate resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.HEART_RATE,
                    '2020-10-01', '2020-10-01',
                    '00:00:00', '23:59:59',
                    '10m')
                    .then(result => {
                        expect(result.data_set.length).to.equal(144)
                        expect(result.data_set).to.deep.equal(intradayHeartRate.toJSON().data_set)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when trying to retrieve time series using invalid parameters', () => {
            const startTime = '2020-10-01T00:00:00'
            const endTime = '2020-10-01T23:59:59'
            const intradaySteps: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.STEPS)
            intradaySteps.patientId = '4a62be07d6f33400146c9b62'

            before(async () => {
                try {
                    await deleteAll()

                    await addIntradayTimeSeries(intradaySteps)
                } catch (err) {
                    throw new Error('Failure on Provider IntradayTimeSeries test: ' + err.message)
                }
            })

            // Delete all timeseries from database after test case.
            after(async () => {
                try {
                    await deleteAll()
                } catch (err) {
                    throw new Error('Failure on Provider IntradayTimeSeries test: ' + err.message)
                }
            })

            it('should return a ValidationException for invalid patientId', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b621', TimeSeriesType.STEPS,
                    '2020-10-01', '2020-10-01',
                    '00:00:00', '23:59:59',
                    '1s')
                    .then(() => done(new Error('The listByIntervalAndTime method of the service should not work normally')))
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT
                                .replace('{0}', '4a62be07d6f33400146c9b621')))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException for invalid resource', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', 'invalidResource',
                    '2020-10-01', '2020-10-01',
                    '00:00:00', '23:59:59',
                    '1s')
                    .then(() => done(new Error('The listByIntervalAndTime method of the service should not work normally')))
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.RESOURCE_NOT_SUPPORTED
                                .replace('{0}', 'invalidResource')))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException for invalid startDate', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.STEPS,
                    '01-10-2020', '2020-10-01',
                    '00:00:00', '23:59:59',
                    '1s')
                    .then(() => done(new Error('The listByIntervalAndTime method of the service should not work normally')))
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT
                                .replace('{0}', '01-10-2020')))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException for invalid endDate', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.STEPS,
                    '2020-10-01', '2262-10-01',
                    '00:00:00', '23:59:59',
                    '1s')
                    .then(() => done(new Error('The listByIntervalAndTime method of the service should not work normally')))
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.DATE.YEAR_NOT_ALLOWED
                                .replace('{0}', '2262-10-01')))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException for invalid interval between dates', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.STEPS,
                    '2020-10-01', '2020-10-02',
                    '00:00:00', '00:00:01',
                    '1s')
                    .then(() => done(new Error('The listByIntervalAndTime method of the service should not work normally')))
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.TIME.RANGE_INVALID))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException for invalid startTime', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.STEPS,
                    '2020-10-01', '2020-10-01',
                    '001:00:00', '23:59:59',
                    '1s')
                    .then(() => done(new Error('The listByIntervalAndTime method of the service should not work normally')))
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT
                                .replace('{0}', '001:00:00')))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException for invalid endTime', (done) => {
                rabbit.executeResource('timeseries.rpc',
                    'intraday.find', '4a62be07d6f33400146c9b62', TimeSeriesType.STEPS,
                    '2020-10-01', '2020-10-01',
                    '00:00:00', '24:00:00',
                    '1s')
                    .then(() => done(new Error('The listByIntervalAndTime method of the service should not work normally')))
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT
                                .replace('{0}', '24:00:00')))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })
        })
    })
})

async function addIntradayTimeSeries(intradayTimeSeries: IntradayTimeSeries): Promise<void> {
    const repo: IIntradayTimeSeriesRepository = DIContainer.get<IIntradayTimeSeriesRepository>(Identifier.INTRADAY_REPOSITORY)
    await repo.create(intradayTimeSeries)
}

function deleteAll(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!db.connection) return resolve()
        db.connection
            .query(`DROP SERIES FROM ${Default.MEASUREMENT_TIMESERIES_NAME};
                DROP SERIES FROM ${Default.MEASUREMENT_HR_ZONES_NAME}`
            )
            .then(() => resolve())
            .catch((err) => reject(err))
    })
}
