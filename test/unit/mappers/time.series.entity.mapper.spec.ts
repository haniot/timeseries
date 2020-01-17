import { assert } from 'chai'
import { TimeSeriesMock } from '../../mocks/time.series.mock'
import { TimeSeriesEntity } from '../../../src/infrastructure/entity/time.series.entity'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { TimeSeries } from '../../../src/application/domain/model/time.series'
import { IEntityMapper } from '../../../src/infrastructure/port/entity.mapper.interface'
import { Default } from '../../../src/utils/default'
import { Item } from '../../../src/application/domain/model/item'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'
import { TimeSeriesDBMock } from '../../mocks/time.series.db.mock'
import { Summary } from '../../../src/application/domain/model/summary'
import { HeartRateItem } from '../../../src/application/domain/model/heart.rate.item'
import moment from 'moment'
import { HeartRateSummary } from '../../../src/application/domain/model/heart.rate.summary'
import { HeartRateZoneType } from '../../../src/application/domain/utils/heart.rate.zone.type'

describe('MAPPERS: TimeSeriesEntityMapper', () => {
    const mapper: IEntityMapper<TimeSeries, TimeSeriesEntity> = DIContainer.get(Identifier.TIME_SERIES_ENTITY_MAPPER)

    context('TRANSFORM TimeSeries object into TimeSeriesEntity.', () => {
        it('should transform the TimeSeries object of type steps into TimeSeriesEntity.', () => {
            const timeSeries = new TimeSeriesMock()
                .generate('2018-12-01', '2019-12-01', TimeSeriesType.STEPS)
            const result: TimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 366)
        })

        it('should transform the TimeSeries object of type distance into TimeSeriesEntity.', () => {
            const timeSeries = new TimeSeriesMock()
                .generate('2019-06-01', '2019-06-05', TimeSeriesType.DISTANCE)
            const result: TimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 5)
        })

        it('should transform the TimeSeries object of type calories into TimeSeriesEntity.', () => {
            const timeSeries = new TimeSeriesMock()
                .generate('2019-12-01', '2019-12-25', TimeSeriesType.CALORIES)
            const result: TimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 25)
        })

        it('should transform the TimeSeries object of type active_minutes into TimeSeriesEntity.', () => {
            const timeSeries = new TimeSeriesMock()
                .generate('2019-10-01', '2019-12-01', TimeSeriesType.ACTIVE_MINUTES)
            const result: TimeSeriesEntity = mapper.transform(timeSeries)

            assertTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 62)
        })

        it('should transform the TimeSeries object of type heart_rate into TimeSeriesEntity.', () => {
            const timeSeries = new TimeSeriesMock()
                .generate('2018-12-01', '2019-12-01', TimeSeriesType.HEART_RATE)
            const result: TimeSeriesEntity = mapper.transform(timeSeries)

            assertHeartRateTimeSeriesEntity(timeSeries, result)
            assert.lengthOf(result.points, 366 * 4)
        })
    })

    context('TRANSFORM json object into TimeSeries.', () => {
        it('should transform the json object of type steps into TimeSeries.', () => {
            const timeSeries: any = new TimeSeriesDBMock()
                .generate('2018-01-01', '2019-01-01', TimeSeriesType.STEPS)
            const result: TimeSeries = mapper.transform(timeSeries)

            assertTimeSeries(timeSeries, result)
            assert.lengthOf(result.dataSet, 366)
        })

        it('should transform the json object of type distance into TimeSeries.', () => {
            const timeSeries: any = new TimeSeriesDBMock()
                .generate('2019-12-01', '2019-12-25', TimeSeriesType.DISTANCE)
            const result: TimeSeries = mapper.transform(timeSeries)

            assertTimeSeries(timeSeries, result)
            assert.lengthOf(result.dataSet, 25)
        })

        it('should transform the json object of type calories into TimeSeries.', () => {
            const timeSeries: any = new TimeSeriesDBMock()
                .generate('2019-06-01', '2019-06-05', TimeSeriesType.CALORIES)
            const result: TimeSeries = mapper.transform(timeSeries)

            assertTimeSeries(timeSeries, result)
            assert.lengthOf(result.dataSet, 5)
        })

        it('should transform the json object of type active_minutes into TimeSeries.', () => {
            const timeSeries: any = new TimeSeriesDBMock()
                .generate('2019-10-01', '2019-12-01', TimeSeriesType.ACTIVE_MINUTES)
            const result: TimeSeries = mapper.transform(timeSeries)

            assertTimeSeries(timeSeries, result)
            assert.lengthOf(result.dataSet, 62)
        })

        it('should transform the json object of type heart_rate into TimeSeries.', () => {
            const expected: any = new TimeSeriesDBMock()
                .generate('2019-01-01', '2019-01-07', TimeSeriesType.HEART_RATE)
            const result: TimeSeries = mapper.transform(expected)

            assertTimeSeriesHR(expected, result)
            assert.lengthOf(result.dataSet, 7)
        })

        it('should turn the json heart_rate object into TimeSeries for equal start and end dates.', () => {
            const expected: any = new TimeSeriesDBMock()
                .generate('2019-12-01', '2019-12-01', TimeSeriesType.HEART_RATE)
            const result: TimeSeries = mapper.transform(expected)
            result.dataSet = result.dataSet as Array<HeartRateItem>

            assertTimeSeriesHR(expected, result)
            assert.lengthOf(result.dataSet, 1)
        })

        context('data_set attribute check.', () => {
            it('should return dataset with defaults objects when data_set is [].', () => {
                const expected: any = new TimeSeriesDBMock()
                    .generate('2019-11-01', '2019-12-01', TimeSeriesType.ACTIVE_MINUTES)

                const expectedDataSet = expected.data_set
                expected.data_set = []
                const result: TimeSeries = mapper.transform(expected)

                assert.lengthOf(result.dataSet, 31)
                for (let i = 0; i < result.dataSet.length; i++) {
                    const item: any = result.dataSet[i]
                    assert.equal(item.date, moment(expectedDataSet[i].time.toISOString()).utc().format('YYYY-MM-DD'))
                    assert.equal(item.value, 0)
                }
            })
        })

        context('Missing attributes in json object.', () => {
            it('should return TimeSeries Object with empty data set.', () => {
                const timeSeries: any = new TimeSeriesDBMock()
                    .generate('2019-12-01', '2019-12-01', TimeSeriesType.ACTIVE_MINUTES)
                timeSeries.data_set = undefined
                const result: TimeSeries = mapper.transform(timeSeries)
                assert.lengthOf(result.dataSet, 0)
            })

            it('should return TimeSeries Object with empty data set.', () => {
                const timeSeries: any = new TimeSeriesDBMock()
                    .generate('2019-10-01', '2019-10-01', TimeSeriesType.HEART_RATE)
                timeSeries.data_set = undefined
                const result: TimeSeries = mapper.transform(timeSeries)
                assert.lengthOf(result.dataSet, 0)
            })
        })
    })

    const assertTimeSeriesEntity = (timeSeries: TimeSeries, result: TimeSeriesEntity) => {
        for (let i = 0; i < timeSeries.dataSet.length; i++) {
            const item: Item = timeSeries.dataSet[i] as Item
            assert.property(result, 'points')
            assert.propertyVal(result.points[i].fields, 'value', item.value)
            assert.propertyVal(result.points[i].tags, 'user_id', timeSeries.patientId)
            assert.propertyVal(result.points[i].tags, 'type', timeSeries.type)
            assert.equal(result.points[i].measurement, Default.MEASUREMENT_TIMESERIES_NAME)
            assert.equal(result.points[i].timestamp, new Date(item.date).getTime() * 1e+6)
        }
    }

    const assertHeartRateTimeSeriesEntity = (hrTimeSeries: TimeSeries, result: TimeSeriesEntity) => {
        for (let i = 0; i < hrTimeSeries.dataSet.length; i++) {
            assert.property(result, 'points')
            assert.property(result.points[i].fields, 'min')
            assert.property(result.points[i].fields, 'max')
            assert.property(result.points[i], 'timestamp')
            assert.propertyVal(result.points[i].tags, 'user_id', hrTimeSeries.patientId)
            assert.equal(result.points[i].measurement, Default.MEASUREMENT_HR_ZONES_NAME)
        }
    }

    const assertTimeSeries = (expected: any, result: TimeSeries) => {
        result.summary = result.summary as Summary

        assert.property(result, 'summary')
        assert.property(result, 'dataSet')
        assert.equal(result.summary.total, expected.total)
        for (let i = 0; i < result.dataSet.length; i++) {
            const item: any = result.dataSet[i]
            assert.equal(item.date, moment(expected.data_set[i].time.toISOString()).utc().format('YYYY-MM-DD'))
            assert.equal(item.value, expected.data_set[i].value)
        }
    }

    const assertTimeSeriesHR = (expected: any, result: TimeSeries) => {
        result.summary = result.summary as HeartRateSummary

        assert.property(result, 'summary')
        assert.property(result, 'dataSet')
        for (let i = 0; i < result.dataSet.length; i++) {
            const item: HeartRateItem = result.dataSet[i] as HeartRateItem
            const zones: any = item.zones.toJSON()
            const expectedDate = expected.data_set[i][0] ? moment(expected.data_set[i][0]
                .time.toISOString()).utc().format('YYYY-MM-DD') : moment(expected.data_set[i]
                .time.toISOString()).utc().format('YYYY-MM-DD')

            assert.equal(item.date, expectedDate)
            assert.property(zones, HeartRateZoneType.OUT_OF_RANGE)
            assert.property(zones, HeartRateZoneType.FAT_BURN)
            assert.property(zones, HeartRateZoneType.CARDIO)
            assert.property(zones, HeartRateZoneType.PEAK)
        }
    }
})
