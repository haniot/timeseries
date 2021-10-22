import { assert } from 'chai'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'
import { IntradayTimeSeriesSyncValidator } from '../../../src/application/domain/validator/intraday.time.series.sync.validator'
import { IntradayTimeSeriesMock } from '../../mocks/intraday.time.series.mock'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { IntradayTimeSeries } from '../../../src/application/domain/model/intraday.time.series'

describe('VALIDATORS: IntradayTimeSeriesSyncValidator', () => {
    const generateSteps = () => {
        return new IntradayTimeSeriesMock().generate(
            '2019-01-01T00:00:00', '2019-01-01T23:59:59', '1m', TimeSeriesType.STEPS
        )
    }
    const generateCalories = () => {
        return new IntradayTimeSeriesMock().generate(
            '2019-01-01T00:00:00', '2019-01-01T23:59:59', '1m', TimeSeriesType.CALORIES
        )
    }
    const generateDistance = () => {
        return new IntradayTimeSeriesMock().generate(
            '2019-01-01T00:00:00', '2019-01-01T23:59:59', '1m', TimeSeriesType.DISTANCE
        )
    }
    const generateActiveMinutes = () => {
        return new IntradayTimeSeriesMock().generate(
            '2019-01-01T00:00:00', '2019-01-01T23:59:59', '1m', TimeSeriesType.ACTIVE_MINUTES
        )
    }
    const generateHeartRate = () => {
        return new IntradayTimeSeriesMock().generate(
            '2019-01-01T00:00:00', '2019-01-01T23:59:59', '1s', TimeSeriesType.HEART_RATE
        )
    }

    context('when parameters are invalid.', () => {
        it('should return ValidationException when a time of an item is invalid.', () => {
            const intradayTimeSeries: Array<any> = [generateSteps(), generateCalories(),
                generateDistance(), generateActiveMinutes(), generateHeartRate()]

            intradayTimeSeries[0].dataSet[15].time! = '22-10-10' // steps
            intradayTimeSeries[1].dataSet[28].time! = '20190128' // calories
            intradayTimeSeries[2].dataSet[14].time! = '10:60:00' // distance
            intradayTimeSeries[3].dataSet[1].time! = '24:00:00' // active_minutes
            intradayTimeSeries[4].dataSet[5].time! = '17:1000' // heart_rate

            let countExceptions = 0
            intradayTimeSeries.forEach((elem: IntradayTimeSeries) => {
                try {
                    IntradayTimeSeriesSyncValidator.validate(elem)
                } catch (e: any) {
                    assert.instanceOf(e, ValidationException)
                    countExceptions += 1
                }
            })
            assert.equal(countExceptions, 5)
        })

        it('should return ValidationException when start_time are invalid.', () => {
            const intradayTimeSeries: Array<any> = [generateSteps(), generateCalories(),
                generateDistance(), generateActiveMinutes(), generateHeartRate()]

            // end_time is not validated as it is not used in the sync event.

            intradayTimeSeries[0].summary.startTime! = '2019-01-01' // steps
            intradayTimeSeries[1].summary.startTime! = '2019-02-31T23:59:59' // calories
            intradayTimeSeries[2].summary.startTime! = '23:59:59' // distance
            intradayTimeSeries[3].summary.startTime! = '2019-01-01T-23:59:59' // active_minutes
            intradayTimeSeries[4].summary.startTime! = '2019-01-01T23:60:00' // heart_rate

            let countExceptions = 0
            intradayTimeSeries.forEach((elem: IntradayTimeSeries) => {
                try {
                    IntradayTimeSeriesSyncValidator.validate(elem)
                } catch (e: any) {
                    assert.instanceOf(e, ValidationException)
                    countExceptions += 1
                }
            })
            assert.equal(countExceptions, 5)
        })

        it('should return ValidationException when heart rate zone values ​​are invalid.', () => {
            const intradayTimeSeries: Array<any> = []
            for (let i = 0; i < 20; i++) {
                intradayTimeSeries.push(new IntradayTimeSeriesMock().generate(
                    '2019-01-01T07:00:00', '2019-01-01T07:25:00', '1m', TimeSeriesType.HEART_RATE
                ))
            }

            // heart_rate
            intradayTimeSeries[0].summary.zones.outOfRange.min = 0
            intradayTimeSeries[1].summary.zones.outOfRange.max = 'T10'
            intradayTimeSeries[2].summary.zones.fatBurn.min = -10
            intradayTimeSeries[3].summary.zones.fatBurn.max = 0
            intradayTimeSeries[4].summary.zones.fatBurn.min = -10
            intradayTimeSeries[5].summary.zones.fatBurn.max = 0
            intradayTimeSeries[6].summary.zones.cardio.min = 0
            intradayTimeSeries[7].summary.zones.cardio.max = '35B'
            intradayTimeSeries[8].summary.zones.peak.min = 'XX'
            intradayTimeSeries[9].summary.zones.peak.max = '-159'
            intradayTimeSeries[10].summary.zones.outOfRange.calories = -150
            intradayTimeSeries[11].summary.zones.outOfRange.duration = -1.555
            intradayTimeSeries[12].summary.zones.fatBurn.calories = '-1'
            intradayTimeSeries[13].summary.zones.fatBurn.duration = -56000
            intradayTimeSeries[14].summary.zones.fatBurn.calories = '-1.23333333333'
            intradayTimeSeries[15].summary.zones.fatBurn.duration = '2.66666'
            intradayTimeSeries[16].summary.zones.cardio.calories = '1000A'
            intradayTimeSeries[17].summary.zones.cardio.duration = -1000
            intradayTimeSeries[18].summary.zones.peak.calories = 'XX'
            intradayTimeSeries[19].summary.zones.peak.duration = '-159'

            let countExceptions = 0
            intradayTimeSeries.forEach((elem: IntradayTimeSeries) => {
                try {
                    IntradayTimeSeriesSyncValidator.validate(elem)
                } catch (e: any) {
                    assert.instanceOf(e, ValidationException)
                    countExceptions += 1
                }
            })
            assert.equal(countExceptions, 20)
        })
    })

    context('when parameters are valid.', () => {
        it('should not throw ValidationException with parameters are valid: ' +
            'steps, calories, distance, active_minutes, heart_rate.', () => {
            try {
                IntradayTimeSeriesSyncValidator.validate(generateSteps())
                IntradayTimeSeriesSyncValidator.validate(generateCalories())
                IntradayTimeSeriesSyncValidator.validate(generateDistance())
                IntradayTimeSeriesSyncValidator.validate(generateActiveMinutes())
                IntradayTimeSeriesSyncValidator.validate(generateHeartRate())
            } catch (e: any) {
                assert.fail(e)
            }
        })
    })
})
