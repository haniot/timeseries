import moment from 'moment'
import { assert } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IEntityMapper } from '../../../src/infrastructure/port/entity.mapper.interface'
import { Default } from '../../../src/utils/default'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'
import { IntradayTimeSeries } from '../../../src/application/domain/model/intraday.time.series'
import { IntradayTimeSeriesMock } from '../../mocks/intraday.time.series.mock'
import { IntradayTimeSeriesEntity } from '../../../src/infrastructure/entity/intraday.time.series.entity'
import { IntradayItem } from '../../../src/application/domain/model/intraday.item'
import { IntradayTimeSeriesDBMock } from '../../mocks/intraday.time.series.db.mock'
import { IntradaySummary } from '../../../src/application/domain/model/intraday.summary'
import { IntradayHeartRateSummary } from '../../../src/application/domain/model/intraday.heart.rate.summary'

describe('MAPPERS: IntradayTimeSeriesEntityMapper', () => {
    const mapper: IEntityMapper<IntradayTimeSeries, IntradayTimeSeriesEntity> = DIContainer.get(Identifier.INTRADAY_ENTITY_MAPPER)

    context('TRANSFORM IntradayTimeSeries object into IntradayTimeSeriesEntity.', () => {
        it('should transform the IntradayTimeSeries object of type steps into IntradayTimeSeriesEntity.', () => {
            const timeSeries = new IntradayTimeSeriesMock()
                .generate('2020-01-05T00:00:00', '2020-01-05T23:59:59', '1m', TimeSeriesType.STEPS)
            const result: IntradayTimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 1440)
        })

        it('should transform the IntradayTimeSeries object of type distance into IntradayTimeSeriesEntity.', () => {
            const timeSeries = new IntradayTimeSeriesMock()
                .generate('2019-12-01T00:00:00',
                    '2019-12-01T03:00:00', '15min', TimeSeriesType.DISTANCE)
            const result: IntradayTimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 12)
        })

        it('should transform the IntradayTimeSeries object of type calories into IntradayTimeSeriesEntity.', () => {
            const timeSeries = new IntradayTimeSeriesMock()
                .generate('2019-12-01T00:00:00', '2019-12-01T02:15:00', '15m', TimeSeriesType.CALORIES)
            const result: IntradayTimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 9)
        })

        it('should transform the IntradayTimeSeries object of type active_minutes into IntradayTimeSeriesEntity.', () => {
            const timeSeries = new IntradayTimeSeriesMock()
                .generate('2019-12-01T02:05:00', '2019-12-01T02:20:00', '1m', TimeSeriesType.ACTIVE_MINUTES)
            const result: IntradayTimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 15)
        })

        it('should transform the IntradayTimeSeries object of type heart_rate into IntradayTimeSeriesEntity.', () => {
            const timeSeries = new IntradayTimeSeriesMock()
                .generate('2019-12-01T02:05:00', '2019-12-01T02:06:00', '1s', TimeSeriesType.HEART_RATE)
            const result: IntradayTimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assertHeartRateIntradayTimeSeriesEntity(result)
            assert.lengthOf(result.points, 60)
        })
    })

    context('TRANSFORM json object into IntradayTimeSeries.', () => {
        it('should transform the json object of type steps into TimeSeries.', () => {
            const timeSeries: any = new IntradayTimeSeriesDBMock()
                .generate('2020-01-06T03:00:00', '2020-01-07T02:59:59', '1m', TimeSeriesType.STEPS)
            const result: IntradayTimeSeries = mapper.transform(timeSeries)

            assertTimeSeries(timeSeries, result)
            assert.lengthOf(result.dataSet, 1440)
        })

        it('should transform the json object of type distance into IntradayTimeSeries.', () => {
            const timeSeries: any = new IntradayTimeSeriesDBMock()
                .generate('2020-01-06T03:00:00', '2020-01-06T03:10:00', '1m', TimeSeriesType.DISTANCE)
            const result: IntradayTimeSeries = mapper.transform(timeSeries)

            assertTimeSeries(timeSeries, result)
            assert.lengthOf(result.dataSet, 10)
        })

        it('should transform the json object of type calories into IntradayTimeSeries.', () => {
            const timeSeries: any = new IntradayTimeSeriesDBMock()
                .generate('2020-01-06T03:00:00', '2020-01-06T04:00:00', '1m', TimeSeriesType.CALORIES)
            const result: IntradayTimeSeries = mapper.transform(timeSeries)

            assertTimeSeries(timeSeries, result)
            assert.lengthOf(result.dataSet, 60)
        })

        it('should transform the json object of type active_minutes into IntradayTimeSeries.', () => {
            const timeSeries: any = new IntradayTimeSeriesDBMock()
                .generate('2020-01-06T03:00:00', '2020-01-06T03:15:00', '1m', TimeSeriesType.ACTIVE_MINUTES)
            const result: IntradayTimeSeries = mapper.transform(timeSeries)

            assertTimeSeries(timeSeries, result)
            assert.lengthOf(result.dataSet, 15)
        })

        it('should transform the json object of type heart_rate into IntradayTimeSeries.', () => {
            const expected: any = new IntradayTimeSeriesDBMock()
                .generate('2020-01-06T03:00:00.000Z', '2020-01-07T02:59:59.000Z', '1s', TimeSeriesType.HEART_RATE)
            const result: IntradayTimeSeries = mapper.transform(expected)

            assert.property(result, 'summary')
            assert.property(result, 'dataSet')
            assert.property(result.summary, 'zones')

            result.summary = result.summary as IntradayHeartRateSummary
            assert.equal(result.summary.min, expected.min)
            assert.equal(result.summary.max, expected.max)
            assert.equal(result.summary.average, expected.average)

            for (let i = 0; i < result.dataSet.length; i++) {
                const item: any = result.dataSet[i]
                assert.equal(item.time, moment(expected.data_set[i].time.toISOString()).utc().format('HH:mm:ss'))
                assert.equal(item.value, expected.data_set[i].value)
            }
        })

        context('data_set attribute check.', () => {
            it('should return dataset with defaults objects when data_set is [].', () => {
                const expected: any = new IntradayTimeSeriesDBMock()
                    .generate('2020-01-05T03:00:00', '2020-01-05T03:15:59', '1m', TimeSeriesType.ACTIVE_MINUTES)
                const expectedDataSet = expected.data_set
                expected.data_set = []
                const result: IntradayTimeSeries = mapper.transform(expected)

                assert.lengthOf(result.dataSet, 16)
                for (let i = 0; i < result.dataSet.length; i++) {
                    const item: any = result.dataSet[i]
                    assert.equal(item.time, moment(expectedDataSet[i].time.toISOString()).utc().format('HH:mm:ss'))
                    assert.equal(item.value, 0)
                }
            })

            it('should return dataset (heart_rate) with defaults objects when data_set is [].', () => {
                const expected: any = new IntradayTimeSeriesDBMock()
                    .generate('2020-01-06T03:00:00', '2020-01-06T03:15:00', '1m', TimeSeriesType.HEART_RATE)

                expected.data_set = []
                const result: IntradayTimeSeries = mapper.transform(expected)

                assert.lengthOf(result.dataSet, 0)
            })
        })

        context('Missing attributes in json object.', () => {
            it('should return IntradayTimeSeries Object with empty data set.', () => {
                const timeSeries: any = new IntradayTimeSeriesDBMock()
                    .generate('2020-01-06T03:00:00', '2020-01-06T03:15:00', '1m', TimeSeriesType.STEPS)
                timeSeries.data_set = undefined
                const result: IntradayTimeSeries = mapper.transform(timeSeries)
                assert.lengthOf(result.dataSet, 0)
            })

            it('should return IntradayTimeSeries Object with empty data set: heart_rate.', () => {
                const timeSeries: any = new IntradayTimeSeriesDBMock()
                    .generate('2020-01-06T03:00:00', '2020-01-06T03:15:00', '1m', TimeSeriesType.HEART_RATE)
                timeSeries.data_set = undefined
                const result: IntradayTimeSeries = mapper.transform(timeSeries)
                assert.lengthOf(result.dataSet, 0)
            })
        })
    })

    const assertTimeSeriesEntity = (timeSeries: IntradayTimeSeries, result: IntradayTimeSeriesEntity) => {
        for (let i = 0; i < timeSeries.dataSet.length; i++) {
            const item: IntradayItem = timeSeries.dataSet[i] as IntradayItem
            assert.property(result, 'points')
            assert.propertyVal(result.points[i].fields, 'value', item.value)
            assert.propertyVal(result.points[i].tags, 'user_id', timeSeries.patientId)
            assert.propertyVal(result.points[i].tags, 'type', timeSeries.type)
            assert.equal(result.points[i].measurement, Default.MEASUREMENT_TIMESERIES_NAME)
            assert.equal(
                result.points[i].timestamp,
                new Date(`${timeSeries.summary.startTime.split('T')[0]}T${item.time}Z`).getTime() * 1e+6
            )
        }
    }

    const assertHeartRateIntradayTimeSeriesEntity = (result: IntradayTimeSeriesEntity) => {
        assert.property(result, 'points')
        assert.property(result, 'pointsHrZones')
        result.pointsHrZones!.forEach(value => {
            assert.property(value.fields, 'max')
            assert.property(value, 'timestamp')
            assert.property(value, 'tags')
        })
    }

    const assertTimeSeries = (expected: any, result: IntradayTimeSeries) => {
        result.summary = result.summary as IntradaySummary

        assert.property(result, 'summary')
        assert.property(result, 'dataSet')
        assert.equal(result.summary.total, expected.total)
        assert.equal(result.summary.startTime, moment(expected.start_time).utc().format('YYYY-MM-DDTHH:mm:ss'))
        assert.equal(result.summary.endTime, moment(expected.end_time).utc().format('YYYY-MM-DDTHH:mm:ss'))
        for (let i = 0; i < result.dataSet.length; i++) {
            const item: any = result.dataSet[i]
            assert.equal(item.time, moment(expected.data_set[i].time.toISOString()).utc().format('HH:mm:ss'))
            assert.equal(item.value, expected.data_set[i].value)
        }
    }
})
