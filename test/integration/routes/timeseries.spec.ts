import { expect } from 'chai'
import { App } from '../../../src/app'
import { DIContainer } from '../../../src/di/di'
import { Strings } from '../../../src/utils/strings'
import { Default } from '../../../src/utils/default'
import { Identifier } from '../../../src/di/identifiers'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { TimeSeries } from '../../../src/application/domain/model/time.series'
import { ITimeSeriesRepository } from '../../../src/application/port/timeseries.repository.interface'
import { TimeSeriesMock } from '../../mocks/time.series.mock'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'
import { TimeSeriesGroup } from '../../../src/application/domain/model/time.series.group'
import { IntradayTimeSeries } from '../../../src/application/domain/model/intraday.time.series'
import { IntradayTimeSeriesMock } from '../../mocks/intraday.time.series.mock'
import { IIntradayTimeSeriesRepository } from '../../../src/application/port/intraday.time.series.repository.interface'

const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())
const db: IDatabase = DIContainer.get(Identifier.INFLUXDB_CONNECTION)

describe('CONTROLLER: timeseries', () => {
    // Start services
    before(async () => {
        await deleteAll()
    })

    // Delete all database
    after(async () => {
        await deleteAll()
    })

    describe('/v1/patients/{patient_id}/date/{start_date}/{end_date}/timeseries', () => {
        context('when the request is successful.', () => {
            const startDate = '2019-10-01'
            const endDate = '2019-10-31'
            const tmSteps: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.STEPS)
            tmSteps.patientId = '4a62be07d6f33400146c9b63'
            const tmCalories: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.CALORIES)
            tmCalories.patientId = '4a62be07d6f33400146c9b63'
            const tmDistance: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.DISTANCE)
            tmDistance.patientId = '4a62be07d6f33400146c9b63'
            const tmActiveMinutes: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.ACTIVE_MINUTES)
            tmActiveMinutes.patientId = '4a62be07d6f33400146c9b63'

            before(async () => {
                await db.connect(process.env.MONGODB_URI_TEST || Default.INFLUXDB_URI_TEST)

                await addTimeSeries(tmSteps)
                await addTimeSeries(tmCalories)
                await addTimeSeries(tmDistance)
                await addTimeSeries(tmActiveMinutes)
            })

            after(async () => {
                await deleteAll()
                await db.dispose()
            })

            it('should return status code 200 for timeseries all supported resources except heart_rate.', () => {
                const resultExpect: TimeSeriesGroup = new TimeSeriesGroup(tmSteps, tmCalories, tmDistance, tmActiveMinutes)
                return request
                    .get(`/v1/patients/${tmSteps.patientId}/date/${startDate}/${endDate}/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('steps')
                        expect(res.body).to.have.property('calories')
                        expect(res.body).to.have.property('distance')
                        expect(res.body).to.have.property('active_minutes')
                        expect(res.body).to.deep.equal(resultExpect.toJSON())
                    })
            })

            context('when there is no patient related data.', () => {
                it('should return status code 200 with default time series for all supported resources.', () => {
                    const tmDefault = {
                        summary: { total: 0 },
                        data_set: [
                            { date: '2010-07-01', value: 0 }
                        ]
                    }

                    const resultExpect: any = {
                        steps: tmDefault,
                        calories: tmDefault,
                        distance: tmDefault,
                        active_minutes: tmDefault
                    }

                    return request
                        .get(`/v1/patients/${tmSteps.patientId}/date/2010-07-01/2010-07-01/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('steps')
                            expect(res.body).to.have.property('calories')
                            expect(res.body).to.have.property('distance')
                            expect(res.body).to.have.property('active_minutes')
                            expect(res.body).to.deep.equal(resultExpect)
                        })
                })
            })

            context('when there is at least one patient-related resource type.', () => {
                const _startDate = '2015-09-06'
                const _endDate = '2015-09-07'
                const _tmCalories: TimeSeries = new TimeSeriesMock()
                    .generate(_startDate, _endDate, TimeSeriesType.CALORIES)
                _tmCalories.patientId = '4a62be07d6f33400146c9b63'
                const _tmDistance: TimeSeries = new TimeSeriesMock()
                    .generate(_startDate, _endDate, TimeSeriesType.DISTANCE)
                _tmDistance.patientId = '4a62be07d6f33400146c9b63'

                before(async () => {
                    await deleteAll()

                    await addTimeSeries(_tmCalories)
                    await addTimeSeries(_tmDistance)
                })

                after(async () => {
                    await deleteAll()
                })

                it('should return status code 200 with default time series for only' +
                    ' resources that have no saved data.', async () => {
                    const tmDefault = {
                        summary: { total: 0 },
                        data_set: [
                            { date: _startDate, value: 0 },
                            { date: _endDate, value: 0 }
                        ]
                    }

                    const resultExpect: any = {
                        steps: tmDefault,
                        calories: _tmCalories.toJSON(),
                        distance: _tmDistance.toJSON(),
                        active_minutes: tmDefault
                    }

                    return request
                        .get(`/v1/patients/${tmSteps.patientId}/date/2015-09-06/2015-09-07/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property('steps')
                            expect(res.body).to.have.property('calories')
                            expect(res.body).to.have.property('distance')
                            expect(res.body).to.have.property('active_minutes')
                            expect(res.body).to.deep.equal(resultExpect)
                        })
                })
            })
        })

        context('when the request is not successful.', () => {
            before(async () => {
                await db.dispose()
            })

            it('should return status code 500 when it has no database connection.', () => {
                return request
                    .get(`/v1/patients/4a62be07d6f33400146c9b63/date/2019-10-11/2019-10-11/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(500)
                    .then(res => {
                        expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.UNEXPECTED)
                    })
            })

            context('when you have validation problem', () => {
                before(async () => {
                    await db.connect(process.env.MONGODB_URI_TEST || Default.INFLUXDB_URI_TEST)
                })

                after(async () => {
                    await db.dispose()
                })

                it('should return status code 400 when patient_id is not in valid format.', () => {
                    return request
                        .get(`/v1/patients/4a62be07d6f33400146c9b6315699a/date/2019-10-11/2019-10-11/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(
                                Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT
                                    .replace('{0}', '4a62be07d6f33400146c9b6315699a')
                            )
                            expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        })
                })

                it('should return status code 400 when start_date and end_date is not in valid format.', () => {
                    return request
                        .get(`/v1/patients/1a62be07d6f33400146c9b63/date/01-05-2019/2019-10-11/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(
                                Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', '01-05-2019')
                            )
                            expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT_DESC)
                        })
                })

                it('should return status code 400 when end date is less than start date.', () => {
                    return request
                        .get(`/v1/patients/1a62be07d6f33400146c9b63/date/2017-08-15/2017-06-11/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.DATE.RANGE_INVALID
                                .replace('{0}', '2017-08-15')
                                .replace('{1}', '2017-06-11'))
                            expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.DATE.RANGE_INVALID_DESC)
                        })
                })

                it('should return status code 400 when a date has the wrong total days.', () => {
                    return request
                        .get(`/v1/patients/1a62be07d6f33400146c9b63/date/2019-02-29/2019-03-15/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT
                                .replace('{0}', '2019-02-29'))
                        })
                })

                it('return status code 400 when the difference between start and end date is greater than 1 year.', () => {
                    return request
                        .get(`/v1/patients/1a62be07d6f33400146c9b63/date/2016-01-01/2019-11-19/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.DATE.RANGE_INVALID
                                .replace('{0}', '2016-01-01')
                                .replace('{1}', '2019-11-19'))
                            expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.DATE.RANGE_EXCEED_YEAR_DESC)
                        })
                })
            })
        })
    })

    describe('/v1/patients/{patient_id}/{resource}/date/{start_date}/{end_date}/timeseries', () => {
        context('when the request is successful.', () => {
            const startDate = '2019-01-01'
            const endDate = '2019-12-31'
            const tmSteps: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.STEPS)
            const tmDistance: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.DISTANCE)
            const tmActiveMinutes: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.ACTIVE_MINUTES)
            const tmHeartRate: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.HEART_RATE)
            const tmCalories: TimeSeries = new TimeSeriesMock().generate(startDate, endDate, TimeSeriesType.CALORIES)
            tmCalories.patientId = tmHeartRate.patientId

            before(async () => {
                await db.connect(process.env.MONGODB_URI_TEST || Default.INFLUXDB_URI_TEST)

                await addTimeSeries(tmSteps)
                await addTimeSeries(tmCalories)
                await addTimeSeries(tmDistance)
                await addTimeSeries(tmActiveMinutes)
                await addTimeSeries(tmHeartRate)
            })

            after(async () => {
                await deleteAll()
                await db.dispose()
            })

            it('should return status code 200 for timeseries of type steps.', () => {
                return request
                    .get(`/v1/patients/${tmSteps.patientId}/steps/date/${startDate}/${endDate}/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.data_set.length).to.equal(tmSteps.dataSet.length)
                        expect(res.body).to.deep.equal(tmSteps.toJSON())
                    })
            })

            it('should return status code 200 for timeseries of type calories.', () => {
                return request
                    .get(`/v1/patients/${tmCalories.patientId}/calories/date/${startDate}/${endDate}/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.data_set.length).to.equal(tmCalories.dataSet.length)
                        expect(res.body).to.deep.equal(tmCalories.toJSON())
                    })
            })

            it('should return status code 200 for timeseries of type distance.', () => {
                return request
                    .get(`/v1/patients/${tmDistance.patientId}/distance/date/${startDate}/${endDate}/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.data_set.length).to.equal(tmDistance.dataSet.length)
                        expect(res.body).to.deep.equal(tmDistance.toJSON())
                    })
            })

            it('should return status code 200 for timeseries of type active_minutes.', () => {
                return request
                    .get(`/v1/patients/${tmActiveMinutes.patientId}/active_minutes/date/${startDate}/${endDate}/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.data_set.length).to.equal(tmActiveMinutes.dataSet.length)
                        expect(res.body).to.deep.equal(tmActiveMinutes.toJSON())
                    })
            })

            it('should return status code 200 for time series of type heart_rate.', () => {
                return request
                    .get(`/v1/patients/${tmHeartRate.patientId}/heart_rate/date/${startDate}/${endDate}/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.data_set.length).to.equal(tmHeartRate.dataSet.length)
                        expect(res.body).to.deep.equal(tmHeartRate.toJSON())
                    })
            })

            it('should return status code 200 for time series of type heart_rate (data intraday).', async () => {
                await db.connect(process.env.MONGODB_URI_TEST || Default.INFLUXDB_URI_TEST)
                const startTime = '2017-06-01T00:00:00.000Z'
                const endTime = '2017-06-01T23:59:59.000Z'
                const intradayHeartRate: IntradayTimeSeries = new IntradayTimeSeriesMock()
                    .generate(startTime, endTime, '1m', TimeSeriesType.HEART_RATE)
                const intradayCalories: IntradayTimeSeries = new IntradayTimeSeriesMock()
                    .generate(startTime, endTime, '1m', TimeSeriesType.CALORIES)
                intradayCalories.patientId = intradayHeartRate.patientId

                await addIntradayTimeSeries(intradayCalories)
                await addIntradayTimeSeries(intradayHeartRate)

                return request
                    .get(`/v1/patients/${intradayHeartRate.patientId}/heart_rate/date/2017-06-01/2017-06-01/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .then(res => {
                        const item: any = res.body.data_set[0]
                        expect(res.body.data_set.length).to.equal(1)
                        expect(item.date).to.equal('2017-06-01')
                    })
            })

            context('when there is no data related to patient id.', () => {
                it('return status code 200 with default timeseries of the types:' +
                    ' steps, calories, distance and active_minutes.', async () => {
                    const tmDefault = {
                        summary: { total: 0 },
                        data_set: [
                            { date: '2019-01-05', value: 0 },
                            { date: '2019-01-06', value: 0 },
                            { date: '2019-01-07', value: 0 },
                            { date: '2019-01-08', value: 0 },
                            { date: '2019-01-09', value: 0 }
                        ]
                    }

                    const requests = [
                        request.get(`/v1/patients/1a62be07d6f33400146c9b63/steps/date/2019-01-05/2019-01-09/timeseries`),
                        request.get(`/v1/patients/1a62be07d6f33400146c9b63/calories/date/2019-01-05/2019-01-09/timeseries`),
                        request.get(`/v1/patients/1a62be07d6f33400146c9b63/distance/date/2019-01-05/2019-01-09/timeseries`),
                        request.get(`/v1/patients/1a62be07d6f33400146c9b63/active_minutes/date/2019-01-05/2019-01-09/timeseries`)
                    ]

                    const result = await Promise.all(requests)
                    for (let i = 0; i < requests.length; i++) {
                        expect(result[i].body.data_set.length).to.equal(tmDefault.data_set.length)
                        expect(result[i].body).to.deep.equal(tmDefault)
                    }
                })

                it('return status code 200 with default timeseries of the types: heart_rate', async () => {
                    const zonesDefault = {
                        out_of_range: { min: 0, max: 0, calories: 0, duration: 0 },
                        fat_burn: { min: 0, max: 0, calories: 0, duration: 0 },
                        cardio: { min: 0, max: 0, calories: 0, duration: 0 },
                        peak: { min: 0, max: 0, calories: 0, duration: 0 }
                    }
                    const tmDefault = {
                        summary: { out_of_range_total: 0, fat_burn_total: 0, cardio_total: 0, peak_total: 0 },
                        data_set: [
                            { date: '2019-01-05', zones: zonesDefault },
                            { date: '2019-01-06', zones: zonesDefault },
                            { date: '2019-01-07', zones: zonesDefault },
                            { date: '2019-01-08', zones: zonesDefault },
                            { date: '2019-01-09', zones: zonesDefault }
                        ]
                    }

                    const result = await request.get(`/v1/patients/1a62be07d6f33400146c9b63/heart_rate/date/2019-01-05/2019-01-09/timeseries`)

                    expect(result.body.data_set.length).to.equal(tmDefault.data_set.length)
                    expect(result.body).to.deep.equal(tmDefault)
                })
            })
        })

        context('when the request is not successful.', () => {
            const tmSteps: TimeSeries = new TimeSeriesMock()
                .generate('2019-10-11', '2019-10-11', TimeSeriesType.STEPS)

            before(async () => {
                await db.dispose()
            })

            it('should return status code 500 when it has no database connection.', () => {
                return request
                    .get(`/v1/patients/${tmSteps.patientId}/steps/date/2019-10-11/2019-10-11/timeseries`)
                    .set('Accept', 'application/json')
                    .expect(500)
                    .then(res => {
                        expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.UNEXPECTED)
                    })
            })

            context('when you have validation problem', () => {
                before(async () => {
                    await db.connect(process.env.MONGODB_URI_TEST || Default.INFLUXDB_URI_TEST)
                })

                after(async () => {
                    await db.dispose()
                })

                it('should return status code 400 when patient_id is not in valid format.', () => {
                    return request
                        .get(`/v1/patients/123/steps/date/2019-10-11/2019-10-11/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(
                                Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT.replace('{0}', '123')
                            )
                            expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                        })
                })

                it('should return status code 400 when the resource is not supported.', () => {
                    return request
                        .get(`/v1/patients/1a62be07d6f33400146c9b63/temperature/date/2019-10-11/2019-10-11/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(
                                Strings.ERROR_MESSAGE.RESOURCE_NOT_SUPPORTED
                                    .replace('{0}', 'temperature')
                            )
                            expect(res.body.description).to.equal(
                                Strings.ERROR_MESSAGE.RESOURCE_SUPPORTED
                                    .replace('{0}', Object.values(TimeSeriesType).join(', '))
                            )
                        })
                })

                it('should return status code 400 when start_date and end_date is not in valid format.', () => {
                    return request
                        .get(`/v1/patients/1a62be07d6f33400146c9b63/steps/date/01-05-2019/2019-10-11/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(
                                Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', '01-05-2019')
                            )
                            expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT_DESC)
                        })
                })

                it('should return status code 400 when end date is less than start date.', () => {
                    return request
                        .get(`/v1/patients/1a62be07d6f33400146c9b63/steps/date/2019-11-05/2019-10-01/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.DATE.RANGE_INVALID
                                .replace('{0}', '2019-11-05')
                                .replace('{1}', '2019-10-01'))
                            expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.DATE.RANGE_INVALID_DESC)
                        })
                })

                it('return status code 400 when the difference between start and end date is greater than 1 year.', () => {
                    return request
                        .get(`/v1/patients/1a62be07d6f33400146c9b63/steps/date/2019-01-01/2020-01-02/timeseries`)
                        .set('Accept', 'application/json')
                        .expect(400)
                        .then(res => {
                            expect(res.body.message).to.equal(Strings.ERROR_MESSAGE.DATE.RANGE_INVALID
                                .replace('{0}', '2019-01-01')
                                .replace('{1}', '2020-01-02'))
                            expect(res.body.description).to.equal(Strings.ERROR_MESSAGE.DATE.RANGE_EXCEED_YEAR_DESC)
                        })
                })

                it('must return status code 400 when date is less than minimum date 1678.', async () => {
                    const requests = [
                        request.get(`/v1/patients/1a62be07d6f33400146c9b63/steps/date/1677-11-05/2019-10-01/timeseries`),
                        request.get(`/v1/patients/1a62be07d6f33400146c9b63/steps/date/2019-10-01/1670-11-05/timeseries`),
                        request.get(`/v1/patients/1a62be07d6f33400146c9b63/steps/date/2270-10-01/1670-11-05/timeseries`),
                        request.get(`/v1/patients/1a62be07d6f33400146c9b63/steps/date/2019-10-01/2285-01-09/timeseries`)
                    ]
                    const result: any[] = await Promise.all(requests)

                    expect(result[0].statusCode).to.equal(400)
                    expect(result[0].body.message).to.equal(
                        Strings.ERROR_MESSAGE.DATE.YEAR_NOT_ALLOWED.replace('{0}', '1677-11-05')
                    )

                    expect(result[1].statusCode).to.equal(400)
                    expect(result[1].body.message).to.equal(
                        Strings.ERROR_MESSAGE.DATE.YEAR_NOT_ALLOWED.replace('{0}', '1670-11-05')
                    )

                    expect(result[2].statusCode).to.equal(400)
                    expect(result[2].body.message).to.equal(
                        Strings.ERROR_MESSAGE.DATE.YEAR_NOT_ALLOWED.replace('{0}', '2270-10-01')
                    )

                    expect(result[3].statusCode).to.equal(400)
                    expect(result[3].body.message).to.equal(
                        Strings.ERROR_MESSAGE.DATE.YEAR_NOT_ALLOWED.replace('{0}', '2285-01-09')
                    )
                })
            })
        })
    })
})

async function addTimeSeries(timeSeries: TimeSeries): Promise<void> {
    const repo: ITimeSeriesRepository = DIContainer.get<ITimeSeriesRepository>(Identifier.TIMESERIES_REPOSITORY)
    await repo.create(timeSeries)
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
