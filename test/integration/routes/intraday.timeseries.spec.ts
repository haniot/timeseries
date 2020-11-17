import { expect } from 'chai'
import { App } from '../../../src/app'
import { DIContainer } from '../../../src/di/di'
import { Default } from '../../../src/utils/default'
import { Identifier } from '../../../src/di/identifiers'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'
import { IntradayTimeSeries } from '../../../src/application/domain/model/intraday.time.series'
import { IIntradayTimeSeriesRepository } from '../../../src/application/port/intraday.time.series.repository.interface'
import { IntradayTimeSeriesMock } from '../../mocks/intraday.time.series.mock'
import { Strings } from '../../../src/utils/strings'
import { Config } from '../../../src/utils/config'

const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())
const db: IDatabase = DIContainer.get(Identifier.INFLUXDB_CONNECTION)

describe('CONTROLLER: intraday.timeseries', () => {
    // Start services
    before(async () => {
        await deleteAll()
    })

    // Delete all database
    after(async () => {
        await deleteAll()
    })

    describe('/v1/patients/{user_id}/{resource}/date/{date}/interval/{interval}/timeseries', () => {
        context('when the request is successful.', () => {
            const startTime = '2019-07-01T00:00:00'
            const endTime = '2019-07-01T23:59:59'
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
            const hrDataSetMinutes = buildDatasetInterval(intradayHeartRate.toJSON().data_set, '1m', TimeSeriesType.HEART_RATE)
            const zonesExpected: any = countZones(hrDataSetMinutes, intradayCalories.dataSet)

            before(async () => {
                const dbConfigs = Config.getInfluxConfig()
                await db.tryConnect(dbConfigs, dbConfigs.options)

                await addIntradayTimeSeries(intradaySteps)
                await addIntradayTimeSeries(intradayCalories)
                await addIntradayTimeSeries(intradayDistance)
                await addIntradayTimeSeries(intradayActiveMinutes)
                await addIntradayTimeSeries(intradayHeartRate)
            })

            after(async () => {
                await deleteAll()
                await db.dispose()
            })

            it('return status code 200 for all resource types when the time series is 1s.', async () => {
                // Only heart_rate has interval in seconds, other resources should be returned automatically in minutes.
                const requests = [
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/steps/date/2019-07-01/interval/1s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/calories/date/2019-07-01/interval/1s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/distance/date/2019-07-01/interval/1s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/active_minutes/date/2019-07-01/interval/1s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/heart_rate/date/2019-07-01/interval/1s/timeseries')
                ]
                const result = await Promise.all(requests)

                // steps
                intradaySteps.summary.endTime! = '2019-07-01T23:59:00'
                expect(result[0].statusCode).to.equal(200)
                expect(result[0].body).to.deep.equal(intradaySteps.toJSON())

                // // calories
                intradayCalories.summary.endTime! = '2019-07-01T23:59:00'
                expect(result[1].statusCode).to.equal(200)
                expect(result[1].body).to.deep.equal(intradayCalories.toJSON())

                // distance
                intradayDistance.summary.endTime! = '2019-07-01T23:59:00'
                expect(result[2].statusCode).to.equal(200)
                expect(result[2].body).to.deep.equal(intradayDistance.toJSON())

                // active_minutes
                intradayActiveMinutes.summary.endTime! = '2019-07-01T23:59:00'
                expect(result[3].statusCode).to.equal(200)
                expect(result[3].body).to.deep.equal(intradayActiveMinutes.toJSON())

                // // heart_rate
                const expected = intradayHeartRate.toJSON()
                expected.summary.zones = zonesExpected
                expect(result[4].statusCode).to.equal(200)
                assertTimeSeriesHeartRate(result[4].body, expected)
            })

            it('return status code 200 for all resource types when the time series is 15s.', async () => {
                // Only heart_rate has interval in seconds, other resources should be returned automatically in minutes.
                const requests = [
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/steps/date/2019-07-01/interval/15s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/calories/date/2019-07-01/interval/15s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/distance/date/2019-07-01/interval/15s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/active_minutes/date/2019-07-01/interval/15s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/heart_rate/date/2019-07-01/interval/15s/timeseries')
                ]
                const result = await Promise.all(requests)

                // steps
                expect(result[0].statusCode).to.equal(200)
                expect(result[0].body.summary).to.deep.equal({
                    ...intradaySteps.toJSON().summary, ...{ interval: '15m', end_time: '2019-07-01T23:45:00' }
                })
                expect(result[0].body.data_set).to.deep.equal(buildDatasetInterval(intradaySteps.toJSON().data_set, '15m'))

                // calories
                expect(result[1].statusCode).to.equal(200)
                expect(result[1].body.summary).to.deep.equal({
                    ...intradayCalories.toJSON().summary, ...{ interval: '15m' }, end_time: '2019-07-01T23:45:00'
                })
                expect(result[1].body.data_set).to.deep.equal(buildDatasetInterval(intradayCalories.toJSON().data_set, '15m'))

                // calories
                expect(result[2].statusCode).to.equal(200)
                expect(result[2].body.summary).to.deep.equal(
                    {
                        ...intradayDistance.toJSON().summary, ...{
                            interval: '15m', end_time: '2019-07-01T23:45:00'
                        }
                    })
                expect(result[2].body.data_set).to.deep.equal(buildDatasetInterval(intradayDistance.toJSON().data_set, '15m'))

                // active_minutes
                expect(result[3].statusCode).to.equal(200)
                expect(result[3].body.summary).to.deep.equal(
                    {
                        ...intradayActiveMinutes.toJSON().summary, ...{ interval: '15m' },
                        end_time: '2019-07-01T23:45:00'
                    }
                )
                expect(result[3].body.data_set).to.deep.equal(
                    buildDatasetInterval(intradayActiveMinutes.toJSON().data_set, '15m')
                )

                // heart_rate
                const hrExpected = intradayHeartRate.toJSON()
                hrExpected.summary.zones = zonesExpected
                hrExpected.summary.interval = '15s'
                hrExpected.summary.end_time = '2019-07-01T23:59:45'
                hrExpected.data_set = buildDatasetInterval(intradayHeartRate.toJSON().data_set, '15s', TimeSeriesType.HEART_RATE)
                expect(result[4].statusCode).to.equal(200)
                assertTimeSeriesHeartRate(result[4].body, hrExpected)
            })

            it('return status code 200 for all resource types when the time series is 1m.', async () => {
                const requests = [
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/steps/date/2019-07-01/interval/1m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/calories/date/2019-07-01/interval/1m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/distance/date/2019-07-01/interval/1m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/active_minutes/date/2019-07-01/interval/1m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/heart_rate/date/2019-07-01/interval/1m/timeseries')
                ]
                const result = await Promise.all(requests)

                // steps
                intradaySteps.summary.endTime! = '2019-07-01T23:59:00'
                expect(result[0].statusCode).to.equal(200)
                expect(result[0].body).to.deep.equal(intradaySteps.toJSON())

                // calories
                intradayCalories.summary.endTime! = '2019-07-01T23:59:00'
                expect(result[1].statusCode).to.equal(200)
                expect(result[1].body).to.deep.equal(intradayCalories.toJSON())

                // distance
                intradayDistance.summary.endTime! = '2019-07-01T23:59:00'
                expect(result[2].statusCode).to.equal(200)
                expect(result[2].body).to.deep.equal(intradayDistance.toJSON())

                // active_minutes
                intradayActiveMinutes.summary.endTime! = '2019-07-01T23:59:00'
                expect(result[3].statusCode).to.equal(200)
                expect(result[3].body).to.deep.equal(intradayActiveMinutes.toJSON())

                // heart_rate
                const expected = intradayHeartRate.toJSON()
                expected.summary.zones = zonesExpected
                expected.data_set = hrDataSetMinutes
                expected.summary.interval = '1m'
                expected.summary.end_time = '2019-07-01T23:59:00'
                expect(result[4].statusCode).to.equal(200)
                assertTimeSeriesHeartRate(result[4].body, expected)
            })

            it('return status code 200 for all resource types when the time series is 15m.', async () => {
                const requests = [
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/steps/date/2019-07-01/interval/15m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/calories/date/2019-07-01/interval/15m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/distance/date/2019-07-01/interval/15m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/active_minutes/date/2019-07-01/interval/15m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b62/heart_rate/date/2019-07-01/interval/15m/timeseries')
                ]
                const result = await Promise.all(requests)

                // steps
                intradaySteps.summary.endTime! = '2019-07-01T23:45:00'
                expect(result[0].statusCode).to.equal(200)
                expect(result[0].body.data_set).to.deep.equal(
                    buildDatasetInterval(intradaySteps.toJSON().data_set, '15m'))

                // calories
                intradayCalories.summary.endTime! = '2019-07-01T23:45:00'
                expect(result[1].statusCode).to.equal(200)
                expect(result[1].body.data_set).to.deep.equal(
                    buildDatasetInterval(intradayCalories.toJSON().data_set, '15m'))

                // distance
                intradayDistance.summary.endTime! = '2019-07-01T23:45:00'
                expect(result[2].statusCode).to.equal(200)
                expect(result[2].body.data_set).to.deep.equal(
                    buildDatasetInterval(intradayDistance.toJSON().data_set, '15m'))

                // active_minutes
                intradayActiveMinutes.summary.endTime! = '2019-07-01T23:45:00'
                expect(result[3].statusCode).to.equal(200)
                expect(result[3].body.data_set).to.deep.equal(
                    buildDatasetInterval(intradayActiveMinutes.toJSON().data_set, '15m'))

                // heart_rate
                expect(result[4].statusCode).to.equal(200)
                expect(result[4].body.summary.start_time).to.equal(intradayHeartRate.summary.startTime)
                expect(result[4].body.summary.end_time).to.equal('2019-07-01T23:45:00')
                expect(result[4].body.summary.zones).to.deep.equal(zonesExpected)
                expect(result[4].body.data_set).to.deep.equal(
                    buildDatasetInterval(intradayHeartRate.toJSON().data_set, '15m', TimeSeriesType.HEART_RATE)
                )
            })
        })

        context('when the request is not successful.', () => {
            before(async () => {
                await db.dispose()
            })

            it('should return status code 500 when it has no database connection.', () => {
                return request
                    .get('/v1/patients/4a62be07d6f33400146c9b62/steps/date/2019-07-01/interval/1s/timeseries')
                    .set('Accept', 'application/json')
                    .expect(500)
                    .then(res => {
                        expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.UNEXPECTED)
                    })
            })

            context('when you have validation problem', () => {
                before(async () => {
                    const dbConfigs = Config.getInfluxConfig()
                    await db.tryConnect(dbConfigs, dbConfigs.options)
                })

                after(async () => {
                    await db.dispose()
                })

                it('should return status code 400 when user_id is not in valid format.', async () => {
                    const requests = [
                        request.get('/v1/patients/4a62be07d6f33400146c9b6/steps/date/2019-07-01/interval/1m/timeseries'),
                        request.get('/v1/patients/132/calories/date/2019-07-01/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b6Z/distance/date/2019-07-01/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be00WWd6f33400146c9b62/active_minutes/date/2019-07-01/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b6200/heart_rate/date/2019-07-01/interval/1m/timeseries')
                    ]
                    const result = await Promise.all(requests)

                    const assert = (res, idExpected) => {
                        expect(res.statusCode).to.equal(400)
                        expect(res.body.message).to.equal(
                            Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT.replace('{0}', idExpected)
                        )
                        expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    }

                    assert(result[0], '4a62be07d6f33400146c9b6') // steps (id below size)
                    assert(result[1], '132') // calories (id below size)
                    assert(result[2], '4a62be07d6f33400146c9b6Z') // distance (id with invalid characters)
                    assert(result[3], '4a62be00WWd6f33400146c9b62') // distance (id over size and with invalid characters)
                    assert(result[4], '4a62be07d6f33400146c9b6200') // distance (id over size)
                })

                it('should return status code 400 when date parameter is not in valid format.', async () => {
                    const requests = [
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/steps/date/01-07-2019/interval/1s/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/calories/date/2019-02-30/interval/1s/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/distance/date/201907-01/interval/1s/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/active_minutes/date/20190701/interval/1s/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/heart_rate/date/2019-13-01/interval/1s/timeseries')
                    ]
                    const result = await Promise.all(requests)

                    const assert = (res, dateExpected, haveDescription) => {
                        expect(res.statusCode).to.equal(400)
                        expect(res.body.message).to.equal(
                            Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', dateExpected)
                        )
                        if (haveDescription) expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT_DESC)
                        else expect(res.body).to.not.have.property('description')
                    }

                    assert(result[0], '01-07-2019', true) // steps
                    assert(result[1], '2019-02-30', false) // calories
                    assert(result[2], '201907-01', true) // distance
                    assert(result[3], '20190701', true) // active_minutes
                    assert(result[4], '2019-13-01', true) // heart_rate
                })

                it('should return status code 400 when interval parameter is not in valid format.', async () => {
                    const requests = [
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/steps/date/2019-07-01/interval/10.1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/calories/date/2019-07-01/interval/5ss/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/distance/date/2019-07-01/interval/30M/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/active_minutes/date/2019-07-01/' +
                            'interval/0h/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b62/heart_rate/date/2019-07-01/interval/1d/timeseries')
                    ]
                    const result = await Promise.all(requests)

                    const assert = (res, intervalExpected) => {
                        expect(res.statusCode).to.equal(400)
                        expect(res.body.message).to.equal(
                            Strings.ERROR_MESSAGE.INTERVAL_NOT_SUPPORTED.replace('{0}', intervalExpected)
                        )
                        expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.INTERVAL_SUPPORTED)
                    }

                    assert(result[0], '10.1m') // steps
                    assert(result[1], '5ss') // calories
                    assert(result[2], '30M') // distance
                    assert(result[3], '0h') // active_minutes
                    assert(result[4], '1d') // heart_rate
                })
            })
        })
    })

    describe('/v1/patients/{user_id}/{resource}/date/{start_date}/{end_date}' +
        '/time/{start_time}/{end_time}/interval/{interval}/timeseries', () => {
        context('when the request is successful.', () => {
            const startTime = '2020-11-01T00:00:00'
            const endTime = '2020-11-01T23:59:59'
            const intradaySteps: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.STEPS)
            intradaySteps.patientId = '4a62be07d6f33400146c9b63'
            const intradayCalories: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.CALORIES)
            intradayCalories.patientId = '4a62be07d6f33400146c9b63'
            const intradayDistance: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.DISTANCE)
            intradayDistance.patientId = '4a62be07d6f33400146c9b63'
            const intradayActiveMinutes: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.ACTIVE_MINUTES)
            intradayActiveMinutes.patientId = '4a62be07d6f33400146c9b63'
            // The minimum interval of heart_rate is one second, the other resources is one minute.
            const intradayHeartRate: IntradayTimeSeries = new IntradayTimeSeriesMock()
                .generate(startTime, endTime, '1s', TimeSeriesType.HEART_RATE)
            intradayHeartRate.patientId = '4a62be07d6f33400146c9b63'
            const hrDataSetMinutes = buildDatasetInterval(intradayHeartRate.toJSON().data_set,
                '1m', TimeSeriesType.HEART_RATE)
            const zonesExpected = countZones(hrDataSetMinutes, intradayCalories.toJSON().data_set)

            before(async () => {
                const dbConfigs = Config.getInfluxConfig()
                await db.tryConnect(dbConfigs, dbConfigs.options)

                await addIntradayTimeSeries(intradaySteps)
                await addIntradayTimeSeries(intradayCalories)
                await addIntradayTimeSeries(intradayDistance)
                await addIntradayTimeSeries(intradayActiveMinutes)
                await addIntradayTimeSeries(intradayHeartRate)
            })

            after(async () => {
                await deleteAll()
                await db.dispose()
            })

            it('return status code 200 for all resource types when the time series is 1s.', async () => {
                // Only heart_rate has interval in seconds, other resources should be returned automatically in minutes.
                const requests = [
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/steps/date/2020-11-01/2020-11-01' +
                        '/time/10:00/10:50/interval/1s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/calories/date/2020-11-01/2020-11-01' +
                        '/time/00:00:00/23:59:59/interval/1s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/distance/date/2020-11-01/2020-11-01' +
                        '/time/07:05/07:40:15/interval/1s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/active_minutes/date/2020-11-01/2020-11-01' +
                        '/time/00:00/23:59:59/interval/1s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/heart_rate/date/2020-11-01/2020-11-01' +
                        '/time/00:00:00/23:59:59/interval/1s/timeseries')
                ]
                const result = await Promise.all(requests)

                // steps
                expect(result[0].statusCode).to.equal(200)
                expect(result[0].body.data_set.length).to.equal(51)
                expect(result[0].body.data_set[0]).to.deep.equal(
                    intradaySteps.toJSON().data_set.find(el => el.time === '10:00:00')
                )
                expect(result[0].body.data_set[result[0].body.data_set.length - 1]).to.deep.equal(
                    intradaySteps.toJSON().data_set.find(el => el.time === '10:50:00')
                )

                // calories
                intradayCalories.summary.endTime = '2020-11-01T23:59:00'
                expect(result[1].statusCode).to.equal(200)
                expect(result[1].body).to.deep.equal(intradayCalories.toJSON())

                // distance
                expect(result[2].body.data_set.length).to.equal(36)
                expect(result[2].body.data_set[0]).to.deep.equal(
                    intradayDistance.toJSON().data_set.find(el => el.time === '07:05:00')
                )
                expect(result[2].body.data_set[result[2].body.data_set.length - 1]).to.deep.equal(
                    intradayDistance.toJSON().data_set.find(el => el.time === '07:40:00')
                )

                // active_minutes
                intradayActiveMinutes.summary.endTime! = '2020-11-01T23:59:00'
                expect(result[3].statusCode).to.equal(200)
                expect(result[3].body).to.deep.equal(intradayActiveMinutes.toJSON())

                // heart_rate
                expect(result[4].statusCode).to.equal(200)
                expect(result[4].body.data_set.length).to.equal(86400)
                expect(result[4].body.data_set).to.deep.equal(intradayHeartRate.toJSON().data_set)
                expect(result[4].body.summary.zones).to.deep.equal(zonesExpected)
            })

            it('return status code 200 for all resource types when the time series is 15s.', async () => {
                // Only heart_rate has interval in seconds, other resources should be returned automatically in minutes.
                const requests = [
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/steps/date/2020-11-01/2020-11-01' +
                        '/time/10:00/10:50/interval/15s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/calories/date/2020-11-01/2020-11-01' +
                        '/time/00:00:00/23:59:59/interval/15s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/distance/date/2020-11-01/2020-11-01' +
                        '/time/07:05/07:40:15/interval/15s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/active_minutes/date/2020-11-01/2020-11-01' +
                        '/time/00:00/23:59:59/interval/15s/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/heart_rate/date/2020-11-01/2020-11-01' +
                        '/time/00:00:00/23:59:59/interval/15s/timeseries')
                ]
                const result = await Promise.all(requests)

                // steps
                expect(result[0].statusCode).to.equal(200)
                expect(result[0].body.data_set.length).to.equal(4)

                // calories
                expect(result[1].statusCode).to.equal(200)
                expect(result[1].body.data_set.length).to.equal(96)

                // distance
                expect(result[2].body.data_set.length).to.equal(3)

                // active_minutes
                expect(result[3].statusCode).to.equal(200)
                expect(result[3].body.data_set.length).to.equal(96)

                // heart_rate
                expect(result[4].statusCode).to.equal(200)
                expect(result[4].body.data_set.length).to.equal(5760)
            })

            it('return status code 200 for all resource types when the time series is 1m.', async () => {
                // Only heart_rate has interval in seconds, other resources should be returned automatically in minutes.
                const requests = [
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/steps/date/2020-11-01/2020-11-01' +
                        '/time/10:00/10:50/interval/1m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/calories/date/2020-11-01/2020-11-01' +
                        '/time/00:00:00/23:59:59/interval/1m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/distance/date/2020-11-01/2020-11-01' +
                        '/time/07:05/07:40:15/interval/1m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/active_minutes/date/2020-11-01/2020-11-01' +
                        '/time/00:00/23:59:59/interval/1m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/heart_rate/date/2020-11-01/2020-11-01' +
                        '/time/00:00:00/23:59:59/interval/1m/timeseries')
                ]
                const result = await Promise.all(requests)

                // steps
                expect(result[0].statusCode).to.equal(200)
                expect(result[0].body.data_set.length).to.equal(51)
                expect(result[0].body.data_set[0]).to.deep.equal(
                    intradaySteps.toJSON().data_set.find(el => el.time === '10:00:00')
                )
                expect(result[0].body.data_set[result[0].body.data_set.length - 1]).to.deep.equal(
                    intradaySteps.toJSON().data_set.find(el => el.time === '10:50:00')
                )

                // calories
                intradayCalories.summary.endTime! = '2020-11-01T23:59:00'
                expect(result[1].statusCode).to.equal(200)
                expect(result[1].body).to.deep.equal(intradayCalories.toJSON())

                // distance
                expect(result[2].body.data_set.length).to.equal(36)
                expect(result[2].body.data_set[0]).to.deep.equal(
                    intradayDistance.toJSON().data_set.find(el => el.time === '07:05:00')
                )
                expect(result[2].body.data_set[result[2].body.data_set.length - 1]).to.deep.equal(
                    intradayDistance.toJSON().data_set.find(el => el.time === '07:40:00')
                )

                // active_minutes
                intradayActiveMinutes.summary.endTime! = '2020-11-01T23:59:00'
                expect(result[3].statusCode).to.equal(200)
                expect(result[3].body).to.deep.equal(intradayActiveMinutes.toJSON())

                // heart_rate
                expect(result[4].statusCode).to.equal(200)
                expect(result[4].body.data_set.length).to.equal(1440)
                expect(result[4].body.summary.zones).to.deep.equal(zonesExpected)
            })

            it('return status code 200 for all resource types when the time series is 15m.', async () => {
                // Only heart_rate has interval in seconds, other resources should be returned automatically in minutes.
                const requests = [
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/steps/date/2020-11-01/2020-11-01' +
                        '/time/10:00/10:50/interval/15m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/calories/date/2020-11-01/2020-11-01' +
                        '/time/00:00:00/23:59:59/interval/15m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/distance/date/2020-11-01/2020-11-01' +
                        '/time/07:05/07:40:15/interval/15m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/active_minutes/date/2020-11-01/2020-11-01' +
                        '/time/00:00/23:59:59/interval/15m/timeseries'),
                    request.get('/v1/patients/4a62be07d6f33400146c9b63/heart_rate/date/2020-11-01/2020-11-01' +
                        '/time/00:00:00/23:59:59/interval/15m/timeseries')
                ]
                const result = await Promise.all(requests)

                // steps
                expect(result[0].statusCode).to.equal(200)
                expect(result[0].body.data_set.length).to.equal(4)

                // calories
                expect(result[1].statusCode).to.equal(200)
                expect(result[1].body.data_set.length).to.equal(96)

                // distance
                expect(result[2].body.data_set.length).to.equal(3)

                // active_minutes
                expect(result[3].statusCode).to.equal(200)
                expect(result[3].body.data_set.length).to.equal(96)

                // heart_rate
                expect(result[4].statusCode).to.equal(200)
                expect(result[4].body.data_set.length).to.equal(96)
            })
        })

        context('when the request is not successful.', () => {
            before(async () => {
                await db.dispose()
            })

            it('should return status code 500 when it has no database connection.', () => {
                return request
                    .get('/v1/patients/4a62be07d6f33400146c9b63/steps/date/2020-11-01/2020-11-01' +
                        '/time/10:00/10:50/interval/15m/timeseries')
                    .set('Accept', 'application/json')
                    .expect(500)
                    .then(res => {
                        expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.UNEXPECTED)
                    })
            })

            context('when you have validation problem', () => {
                before(async () => {
                    const dbConfigs = Config.getInfluxConfig()
                    await db.tryConnect(dbConfigs, dbConfigs.options)
                })

                after(async () => {
                    await db.dispose()
                })

                it('should return status code 400 when user_id is not in valid format.', async () => {
                    const requests = [
                        request.get('/v1/patients/4a62be07d6f33400146c9b6/steps/date/2020-11-01/2020-11-01' +
                            '/time/10:00/10:50/interval/1m/timeseries'),
                        request.get('/v1/patients/000000000000000/calories/date/2020-11-01/2020-11-01' +
                            '/time/00:00:00/23:59:59/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b6W/distance/date/2020-11-01/2020-11-01' +
                            '/time/07:05/07:40:15/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be00WWd6f33400146c9b62/active_minutes/date/2020-11-01/2020-11-01' +
                            '/time/00:00/23:59:59/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b6200/heart_rate/date/2020-11-01/2020-11-01' +
                            '/time/00:00:00/23:59:59/interval/1m/timeseries')
                    ]
                    const result = await Promise.all(requests)

                    const assert = (res, idExpected) => {
                        expect(res.statusCode).to.equal(400)
                        expect(res.body.message).to.equal(
                            Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT.replace('{0}', idExpected)
                        )
                        expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    }

                    assert(result[0], '4a62be07d6f33400146c9b6') // steps (id below size)
                    assert(result[1], '000000000000000') // calories (id below size)
                    assert(result[2], '4a62be07d6f33400146c9b6W') // distance (id with invalid characters)
                    assert(result[3], '4a62be00WWd6f33400146c9b62') // distance (id over size and with invalid characters)
                    assert(result[4], '4a62be07d6f33400146c9b6200') // distance (id over size)
                })

                it('should return status code 400 when date parameter is not in valid format.', async () => {
                    const requests = [
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/steps/date/01-07-2020/2020-11-01' +
                            '/time/10:00/10:50/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/calories/date/2020-11-01/2019-02-30' +
                            '/time/00:00:00/23:59:59/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/distance/date/20-1907-01/2020-11-01' +
                            '/time/07:05/07:40:15/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/active_minutes/date/20200101/2020-11-01' +
                            '/time/00:00/23:59:59/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/heart_rate/date/2020-11-01/2019-15-01' +
                            '/time/00:00:00/23:59:59/interval/1m/timeseries')
                    ]
                    const result = await Promise.all(requests)

                    const assert = (res, dateExpected, haveDescription) => {
                        expect(res.statusCode).to.equal(400)
                        expect(res.body.message).to.equal(
                            Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', dateExpected)
                        )
                        if (haveDescription) expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT_DESC)
                        else expect(res.body).to.not.have.property('description')
                    }

                    assert(result[0], '01-07-2020', true) // steps
                    assert(result[1], '2019-02-30', false) // calories
                    assert(result[2], '20-1907-01', true) // distance
                    assert(result[3], '20200101', true) // active_minutes
                    assert(result[4], '2019-15-01', true) // heart_rate
                })

                it('should return status code 400 when time parameter is not in valid format.', async () => {
                    const requests = [
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/steps/date/2020-11-01/2020-11-01' +
                            '/time/24:35/10:50/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/calories/date/2020-11-01/2020-11-01' +
                            '/time/00:00:00/00:60:00/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/distance/date/2020-11-01/2020-11-01' +
                            '/time/07:05/153055/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/active_minutes/date/2020-11-01/2020-11-01' +
                            '/time/15:30:60/23:59:59/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/heart_rate/date/2020-11-01/2020-11-01' +
                            '/time/00:00:00/1-15-01/interval/1m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/heart_rate/date/2020-11-01/2020-11-02' +
                            '/time/00:00:00/00:01:00/interval/1m/timeseries')
                    ]
                    const result = await Promise.all(requests)

                    const assert = (res, timeExpected) => {
                        expect(res.statusCode).to.equal(400)
                        expect(res.body.message).to.equal(
                            Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT.replace('{0}', timeExpected)
                        )
                        expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT_DESC)
                    }

                    assert(result[0], '24:35') // steps
                    assert(result[1], '00:60:00') // calories
                    assert(result[2], '153055') // distance
                    assert(result[3], '15:30:60') // active_minutes
                    assert(result[4], '1-15-01') // heart_rate
                    expect(result[5].body).to.deep.equal({
                            code: 400,
                            message: Strings.ERROR_MESSAGE.TIME.RANGE_INVALID,
                            description: Strings.ERROR_MESSAGE.TIME.RANGE_INVALID_DESC
                        }
                    )
                })

                it('should return status code 400 when interval parameter is not in valid format.', async () => {
                    const requests = [
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/steps/date/2020-11-01/2020-11-01' +
                            '/time/10:00/10:50/interval/1sec/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/calories/date/2020-11-01/2020-11-01' +
                            '/time/00:00:00/23:59:59/interval/30.1s/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/distance/date/2020-11-01/2020-11-01' +
                            '/time/07:05/07:40:15/interval/0m/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/active_minutes/date/2020-11-01/2020-11-01' +
                            '/time/00:00/23:59:59/interval/10H/timeseries'),
                        request.get('/v1/patients/4a62be07d6f33400146c9b63/heart_rate/date/2020-11-01/2020-11-01' +
                            '/time/00:00:00/23:59:59/interval/7d/timeseries')
                    ]
                    const result = await Promise.all(requests)

                    const assert = (res, intervalExpected) => {
                        expect(res.statusCode).to.equal(400)
                        expect(res.body.message).to.equal(
                            Strings.ERROR_MESSAGE.INTERVAL_NOT_SUPPORTED.replace('{0}', intervalExpected)
                        )
                        expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.INTERVAL_SUPPORTED)
                    }

                    assert(result[0], '1sec') // steps
                    assert(result[1], '30.1s') // calories
                    assert(result[2], '0m') // distance
                    assert(result[3], '10H') // active_minutes
                    assert(result[4], '7d') // heart_rate
                })
            })
        })
    })
})

function assertTimeSeriesHeartRate(result: any, expected: any) {
    expect(result.summary.min).to.equal(getMin(result.data_set))
    expect(result.summary.max).to.equal(getMax(result.data_set))
    expect(result.summary.average).to.equal(expected.summary.average)
    expect(result.summary.interval).to.equal(expected.summary.interval)
    expect(result.summary.start_time).to.equal(expected.summary.start_time)
    expect(result.summary.end_time).to.equal(expected.summary.end_time)
    expect(result.data_set.length).to.equal(expected.data_set.length)
    expect(result.summary.zones).to.deep.equal(expected.summary.zones)
    expect(result.data_set).to.deep.equal(expected.data_set)
}

function getMin(data) {
    return data.reduce((min, p) => p.value < min ? p.value : min, data[0].value)
}

function getMax(data) {
    return data.reduce((max, p) => p.value > max ? p.value : max, data[0].value)
}

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

function countZones(hr: Array<any>, calories: Array<any>): any {
    const result: any = {
        out_of_range: { min: 30, max: 91, duration: 0, calories: 0 },
        fat_burn: { min: 91, max: 127, duration: 0, calories: 0 },
        cardio: { min: 127, max: 154, duration: 0, calories: 0 },
        peak: { min: 154, max: 220, duration: 0, calories: 0 }
    }

    const getCal = (elem, total) => {
        const v = calories.find(it => it.time === elem.time)
        return v ? total + v.value : total
    }

    hr.forEach(elem => {
        if (elem.value >= result.out_of_range.min && elem.value < result.out_of_range.max) {
            result.out_of_range.duration += 60000
            result.out_of_range.calories = getCal(elem, result.out_of_range.calories)
        } else if (elem.value >= result.fat_burn.min && elem.value < result.fat_burn.max) {
            result.fat_burn.duration += 60000
            result.fat_burn.calories = getCal(elem, result.fat_burn.calories)
        } else if (elem.value >= result.cardio.min && elem.value < result.cardio.max) {
            result.cardio.duration += 60000
            result.cardio.calories = getCal(elem, result.cardio.calories)
        } else if (elem.value >= result.peak.min && elem.value < result.peak.max) {
            result.peak.duration += 60000
            result.peak.calories = getCal(elem, result.peak.calories)
        }
    })
    return result
}

function buildDatasetInterval(data: Array<any>, interval: string, type?: string): any {
    const result: Array<any> = []

    const times: Array<string> = data[0].time.split(':')
    let baseDate = new Date()
    baseDate.setHours(parseInt(times[0], 10))
    baseDate.setMinutes(parseInt(times[1], 10))
    baseDate.setSeconds(parseInt(times[2], 10))
    const intervalValue: number = parseInt(interval.slice(0, -1), 10)
    let countInterval: number = 0

    const updateBaseDate = () => {
        countInterval += intervalValue
        if (countInterval > 60) countInterval = intervalValue
        if (interval.includes('s')) {
            baseDate = new Date(baseDate.setSeconds(countInterval))
        } else {
            baseDate = new Date(baseDate.setMinutes(countInterval))
        }
    }

    let nextTime = `${baseDate.getHours().toString().padStart(2, '0')}:`
        .concat(`${baseDate.getMinutes().toString().padStart(2, '0')}:${baseDate.getSeconds().toString().padStart(2, '0')}`)
    let lastTime = ''
    const updateNextTime = () => {
        lastTime = nextTime
        nextTime = `${baseDate.getHours().toString().padStart(2, '0')}:`
            .concat(`${baseDate.getMinutes().toString().padStart(2, '0')}:${baseDate.getSeconds().toString().padStart(2, '0')}`)
    }

    updateBaseDate()
    updateNextTime()

    let countValue = 0
    let count = 0
    let average = 0
    for (let i = 0; i < data.length; i++) {
        const elem = data[i]
        if (elem.time === nextTime) {
            average = Math.round(countValue / count)
            result.push({ time: lastTime, value: (type === TimeSeriesType.HEART_RATE ? average : countValue) })
            if (data.length - 1 === i) {
                result.push({ time: nextTime, value: (type === TimeSeriesType.HEART_RATE ? average : countValue) })
            }
            updateBaseDate()
            updateNextTime()
            countValue = elem.value
            count = 0
        } else {
            countValue += elem.value
            if (data.length - 1 === i) {
                count++
                average = Math.round(countValue / count)
                result.push({ time: lastTime, value: (type === TimeSeriesType.HEART_RATE ? average : countValue) })
            }
        }
        count++
    }
    return result
}
