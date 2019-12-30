import { assert } from 'chai'
import { TimeSeriesMock } from '../../mocks/time.series.mock'
import { TimeSeriesGroup } from '../../../src/application/domain/model/time.series.group'
import { TimeSeries } from '../../../src/application/domain/model/time.series'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'

describe('MODELS: TimeSeriesGroup', () => {
    const timeSeriesGroupMock: TimeSeriesGroup = new TimeSeriesGroup(
        new TimeSeriesMock()
            .generate('2019-12-01T10:00:00.000Z', '2019-12-31T10:35:00.000Z', 'steps'),
        new TimeSeriesMock()
            .generate('2019-12-01T10:00:00.000Z', '2019-12-31T10:35:00.000Z', 'calories'),
        new TimeSeriesMock()
            .generate('2019-12-01T10:00:00.000Z', '2019-12-31T10:35:00.000Z', 'distance'),
        new TimeSeriesMock()
            .generate('2019-12-01T10:00:00.000Z', '2019-12-31T10:35:00.000Z', 'active_minutes')
    )

    it('should return TimeSeriesGroup object with the correct values ​​according to values ​​set in the builder.', () => {
        const timeSeriesGroup: TimeSeriesGroup = new TimeSeriesGroup(
            timeSeriesGroupMock.steps,
            timeSeriesGroupMock.calories,
            timeSeriesGroupMock.distance,
            timeSeriesGroupMock.activeMinutes
        )

        assert.deepEqual(timeSeriesGroup.steps, timeSeriesGroupMock.steps)
        assert.deepEqual(timeSeriesGroup.calories, timeSeriesGroupMock.calories)
        assert.deepEqual(timeSeriesGroup.distance, timeSeriesGroupMock.distance)
        assert.deepEqual(timeSeriesGroup.activeMinutes, timeSeriesGroupMock.activeMinutes)
    })

    it('should return the populated TimeSeriesGroup object with the attributes set by the set methods.', () => {
        const timeSeriesGroup: TimeSeriesGroup = new TimeSeriesGroup()
        timeSeriesGroup.distance = timeSeriesGroupMock.distance
        timeSeriesGroup.steps = timeSeriesGroupMock.steps
        timeSeriesGroup.activeMinutes = timeSeriesGroupMock.activeMinutes
        timeSeriesGroup.calories = timeSeriesGroupMock.calories

        assert.deepEqual(timeSeriesGroup.steps, timeSeriesGroupMock.steps)
        assert.deepEqual(timeSeriesGroup.calories, timeSeriesGroupMock.calories)
        assert.deepEqual(timeSeriesGroup.distance, timeSeriesGroupMock.distance)
        assert.deepEqual(timeSeriesGroup.activeMinutes, timeSeriesGroupMock.activeMinutes)
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const timeSeriesGroup: TimeSeriesGroup = new TimeSeriesGroup()
        assert.deepEqual(timeSeriesGroup.steps, new TimeSeries(TimeSeriesType.STEPS))
        assert.deepEqual(timeSeriesGroup.calories, new TimeSeries(TimeSeriesType.CALORIES))
        assert.deepEqual(timeSeriesGroup.distance, new TimeSeries(TimeSeriesType.DISTANCE))
        assert.deepEqual(timeSeriesGroup.activeMinutes, new TimeSeries(TimeSeriesType.ACTIVE_MINUTES))
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj: any = {
            steps: timeSeriesGroupMock.steps.toJSON(),
            calories: timeSeriesGroupMock.calories.toJSON(),
            distance: timeSeriesGroupMock.distance.toJSON(),
            active_minutes: timeSeriesGroupMock.activeMinutes.toJSON()
        }
        assert.deepEqual(timeSeriesGroupMock.toJSON(), expectedObj)
    })
})
