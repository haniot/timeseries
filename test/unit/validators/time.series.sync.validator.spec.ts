import { assert } from 'chai'
import { TimeSeriesSyncValidator } from '../../../src/application/domain/validator/time.series.sync.validator'
import { TimeSeriesMock } from '../../mocks/time.series.mock'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'
import { TimeSeries } from '../../../src/application/domain/model/time.series'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'

describe('VALIDATORS: TimeSeriesSyncValidator', () => {
    const generateSteps = () => {
        return new TimeSeriesMock()
            .generate('2019-01-01', '2019-01-30', TimeSeriesType.STEPS)
    }
    const generateCalories = () => {
        return new TimeSeriesMock()
            .generate('2019-01-01', '2019-01-30', TimeSeriesType.CALORIES)
    }
    const generateDistance = () => {
        return new TimeSeriesMock()
            .generate('2020-01-01', '2020-01-15', TimeSeriesType.DISTANCE)
    }
    const generateActiveMinutes = () => {
        return new TimeSeriesMock()
            .generate('2020-01-01', '2020-01-02', TimeSeriesType.ACTIVE_MINUTES)
    }
    const generateHeartRate = () => {
        return new TimeSeriesMock()
            .generate('2019-01-15', '2020-01-15', TimeSeriesType.HEART_RATE)
    }

    context('when parameters are invalid.', () => {
        it('should return ValidationException when a date of an item is invalid.', () => {
            const timeSeries: Array<TimeSeries> = [
                generateSteps(), generateCalories(), generateDistance(), generateActiveMinutes(), generateHeartRate()
            ]
            timeSeries[0].dataSet[15].date! = '2019/01/16' // steps
            timeSeries[1].dataSet[28].date! = '20190128' // calories
            timeSeries[2].dataSet[14].date! = '2019-01-32' // distance
            timeSeries[3].dataSet[1].date! = '2019-01' // active_minutes
            timeSeries[4].dataSet[0].date! = '2019-02-31' // heart_rate

            let countExceptions = 0
            timeSeries.forEach((elem: TimeSeries) => {
                try {
                    TimeSeriesSyncValidator.validate(elem)
                } catch (e: any) {
                    assert.instanceOf(e, ValidationException)
                    countExceptions += 1
                }
            })
            assert.equal(countExceptions, 5)
        })

        it('should return ValidationException when a value of an item is invalid: ' +
            'steps, calories, distance and active_minutes.', () => {
            const timeSeries: Array<any> = [generateSteps(), generateCalories(), generateDistance(), generateActiveMinutes()]

            timeSeries[0].dataSet[13].value = '12.3' // steps
            timeSeries[1].dataSet[2].value = -1.22222 // calories
            timeSeries[2].dataSet[5].value = '100A' // distance
            timeSeries[3].dataSet[1].value = +0.01 // active_minutes

            let countExceptions = 0
            timeSeries.forEach((elem: TimeSeries) => {
                try {
                    TimeSeriesSyncValidator.validate(elem)
                } catch (e: any) {
                    assert.instanceOf(e, ValidationException)
                    countExceptions += 1
                }
            })
            assert.equal(countExceptions, 4)
        })

        it('should return ValidationException when heart rate zone values ​​are invalid.', () => {
            const timeSeries: Array<any> = []
            for (let i = 0; i < 20; i++) timeSeries.push(new TimeSeriesMock()
                .generate('2020-01-01', '2020-01-15', TimeSeriesType.HEART_RATE))

            // heart_rate
            timeSeries[0].dataSet[1].zones.outOfRange.min = 0
            timeSeries[1].dataSet[0].zones.outOfRange.max = -10
            timeSeries[2].dataSet[13].zones.fatBurn.min = -10
            timeSeries[3].dataSet[10].zones.fatBurn.max = 0
            timeSeries[4].dataSet[7].zones.fatBurn.min = -10
            timeSeries[5].dataSet[5].zones.fatBurn.max = 0
            timeSeries[6].dataSet[6].zones.cardio.min = 0
            timeSeries[7].dataSet[7].zones.cardio.max = '35B'
            timeSeries[8].dataSet[0].zones.peak.min = 'XX'
            timeSeries[9].dataSet[2].zones.peak.max = '-159'
            timeSeries[10].dataSet[8].zones.outOfRange.calories = -150
            timeSeries[11].dataSet[9].zones.outOfRange.duration = '1.555'
            timeSeries[12].dataSet[11].zones.fatBurn.calories = '-1'
            timeSeries[13].dataSet[3].zones.fatBurn.duration = -56000
            timeSeries[14].dataSet[13].zones.fatBurn.calories = '-1.23333333333'
            timeSeries[15].dataSet[9].zones.fatBurn.duration = '2.66666'
            timeSeries[16].dataSet[10].zones.cardio.calories = '1000A'
            timeSeries[17].dataSet[1].zones.cardio.duration = -1000
            timeSeries[18].dataSet[0].zones.peak.calories = 'XX'
            timeSeries[19].dataSet[14].zones.peak.duration = '-159'

            let countExceptions = 0
            timeSeries.forEach((elem: TimeSeries) => {
                try {
                    TimeSeriesSyncValidator.validate(elem)
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
                TimeSeriesSyncValidator.validate(generateSteps())
                TimeSeriesSyncValidator.validate(generateCalories())
                TimeSeriesSyncValidator.validate(generateDistance())
                TimeSeriesSyncValidator.validate(generateActiveMinutes())
                TimeSeriesSyncValidator.validate(generateHeartRate())
            } catch (e: any) {
                assert.fail(e)
            }
        })
    })
})
