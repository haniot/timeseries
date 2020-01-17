import { assert } from 'chai'
import { IntradaySummary } from '../../../src/application/domain/model/intraday.summary'

describe('MODELS: IntradaySummary', () => {
    it('should return IntradaySummary object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj = {
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            total: Math.floor(Math.random() * 1000),
            interval: '1min'
        }

        const intradaySummary: IntradaySummary = new IntradaySummary(
            expectedObj.start_time, expectedObj.end_time, expectedObj.total, expectedObj.interval
        )

        assert.equal(intradaySummary.startTime, expectedObj.start_time)
        assert.equal(intradaySummary.endTime, expectedObj.end_time)
        assert.equal(intradaySummary.total, expectedObj.total)
        assert.equal(intradaySummary.interval, expectedObj.interval)
    })

    it('should return the populated IntradaySummary object with the attributes set by the set methods.', () => {
        const intradaySummary: IntradaySummary = new IntradaySummary()
        intradaySummary.startTime = '2019-06-08T00:00:00.000Z'
        intradaySummary.endTime = '2019-06-08T23:59:59.000Z'
        intradaySummary.total = 18520
        intradaySummary.interval = '15min'

        assert.equal(intradaySummary.startTime, '2019-06-08T00:00:00.000Z')
        assert.equal(intradaySummary.endTime, '2019-06-08T23:59:59.000Z')
        assert.equal(intradaySummary.total, 18520)
        assert.equal(intradaySummary.interval, '15min')
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const intradayItem: IntradaySummary = new IntradaySummary()

        assert.equal(intradayItem.startTime, '')
        assert.equal(intradayItem.endTime, '')
        assert.equal(intradayItem.total, 0)
        assert.equal(intradayItem.interval, '')

        const intradayItem2: IntradaySummary = new IntradaySummary(undefined, undefined, 15)
        assert.equal(intradayItem2.startTime, '')
        assert.equal(intradayItem2.endTime, '')
        assert.equal(intradayItem2.total, 15)
        assert.equal(intradayItem2.interval, '')
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj = {
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            total: Math.floor(Math.random() * 1000),
            interval: '1min'
        }
        const intradaySummary: IntradaySummary = new IntradaySummary(
            expectedObj.start_time, expectedObj.end_time, expectedObj.total, expectedObj.interval
        )
        assert.deepEqual(intradaySummary.toJSON(), expectedObj)
    })
})
