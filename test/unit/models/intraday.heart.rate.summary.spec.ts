import { assert } from 'chai'
import { IntradayHeartRateSummary } from '../../../src/application/domain/model/intraday.heart.rate.summary'
import { HeartRateZoneData } from '../../../src/application/domain/model/heart.rate.zone.data'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'

describe('MODELS: IntradayHeartRateSummary', () => {
    const hrZones: HeartRateZone = new HeartRateZone(
        new HeartRateZoneData(30, 91, 150000, 22.0000),
        new HeartRateZoneData(91, 127, 120000, 41.1500),
        new HeartRateZoneData(127, 154, 10000, 15),
        new HeartRateZoneData(154, 220, 135000, 22.0963)
    )

    it('should return IntradayHeartRateSummary object with the correct ' +
        'values ​​according to values ​​set in the builder.', () => {
        const expectedObj: any = {
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            min: Math.floor(Math.random() * 100),
            average: Math.floor(Math.random() * 150),
            interval: '1sec',
            zones: hrZones
        }
        expectedObj.max = expectedObj.min + Math.floor(Math.random() * 100)

        const intradayHeartRateSummary: IntradayHeartRateSummary = new IntradayHeartRateSummary(
            expectedObj.start_time, expectedObj.start_time, expectedObj.min, expectedObj.max,
            expectedObj.average, expectedObj.interval, expectedObj.zones
        )

        assert.equal(intradayHeartRateSummary.startTime, expectedObj.start_time)
        assert.equal(intradayHeartRateSummary.endTime, expectedObj.end_time)
        assert.equal(intradayHeartRateSummary.min, expectedObj.min)
        assert.equal(intradayHeartRateSummary.max, expectedObj.max)
        assert.equal(intradayHeartRateSummary.average, expectedObj.average)
        assert.equal(intradayHeartRateSummary.interval, expectedObj.interval)
        assert.equal(intradayHeartRateSummary.zones, expectedObj.zones)
    })

    it('should return the populated IntradayHeartRateSummary object with the attributes' +
        ' set by the set methods.', () => {
        const intradayHeartRateSummary: IntradayHeartRateSummary = new IntradayHeartRateSummary()
        intradayHeartRateSummary.startTime = '2019-06-08T00:00:00.000Z'
        intradayHeartRateSummary.endTime = '2019-06-08T23:59:59.000Z'
        intradayHeartRateSummary.min = 60
        intradayHeartRateSummary.max = 220
        intradayHeartRateSummary.average = 87
        intradayHeartRateSummary.interval = '1sec'
        intradayHeartRateSummary.zones = new HeartRateZone()

        assert.equal(intradayHeartRateSummary.startTime, '2019-06-08T00:00:00.000Z')
        assert.equal(intradayHeartRateSummary.endTime, '2019-06-08T23:59:59.000Z')
        assert.equal(intradayHeartRateSummary.min, 60)
        assert.equal(intradayHeartRateSummary.max, 220)
        assert.equal(intradayHeartRateSummary.average, 87)
        assert.equal(intradayHeartRateSummary.interval, '1sec')
        assert.deepEqual(intradayHeartRateSummary.zones, new HeartRateZone())
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const intradayHeartRateSummary: IntradayHeartRateSummary = new IntradayHeartRateSummary()

        assert.equal(intradayHeartRateSummary.startTime, '')
        assert.equal(intradayHeartRateSummary.endTime, '')
        assert.equal(intradayHeartRateSummary.min, 0)
        assert.equal(intradayHeartRateSummary.max, 0)
        assert.equal(intradayHeartRateSummary.average, 0)
        assert.equal(intradayHeartRateSummary.interval, '')
        assert.deepEqual(intradayHeartRateSummary.zones, new HeartRateZone())
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj: any = {
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            min: Math.floor(Math.random() * 100),
            average: Math.floor(Math.random() * 90),
            interval: '1min',
            zones: hrZones.toJSON()
        }
        expectedObj.max = expectedObj.min + Math.floor(Math.random() * 100)

        const intradayHeartRateSummary: IntradayHeartRateSummary = new IntradayHeartRateSummary(
            expectedObj.start_time, expectedObj.start_time, expectedObj.min, expectedObj.max,
            expectedObj.average, expectedObj.interval, hrZones
        )
        assert.deepEqual(intradayHeartRateSummary.toJSON(), expectedObj)
    })
})
