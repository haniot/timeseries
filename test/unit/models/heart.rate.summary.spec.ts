import { assert } from 'chai'
import { HeartRateSummary } from '../../../src/application/domain/model/heart.rate.summary'

describe('MODELS: HeartRateSummary', () => {
    it('should return HeartRateSummary object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj = {
            out_of_range_total: Math.floor(Math.random() * 1000),
            fat_burn_total: Math.floor(Math.random() * 1000),
            cardio_total: Math.floor(Math.random() * 1000),
            peak_total: Math.floor(Math.random() * 1000)
        }

        const summary: HeartRateSummary = new HeartRateSummary(
            expectedObj.out_of_range_total,
            expectedObj.fat_burn_total,
            expectedObj.cardio_total,
            expectedObj.peak_total
        )

        assert.equal(summary.outOfRangeTotal, expectedObj.out_of_range_total)
        assert.equal(summary.fatBurnTotal, expectedObj.fat_burn_total)
        assert.equal(summary.cardioTotal, expectedObj.cardio_total)
        assert.equal(summary.peakTotal, expectedObj.peak_total)
    })

    it('should return the populated Summary object with the attributes set by the set methods.', () => {
        const summary: HeartRateSummary = new HeartRateSummary()
        summary.outOfRangeTotal = 1600
        summary.fatBurnTotal = 1000
        summary.cardioTotal = 15600
        summary.peakTotal = 12000

        assert.equal(summary.outOfRangeTotal, 1600)
        assert.equal(summary.fatBurnTotal, 1000)
        assert.equal(summary.cardioTotal, 15600)
        assert.equal(summary.peakTotal, 12000)
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const summary: HeartRateSummary = new HeartRateSummary()
        assert.equal(summary.outOfRangeTotal, 0)
        assert.equal(summary.fatBurnTotal, 0)
        assert.equal(summary.cardioTotal, 0)
        assert.equal(summary.peakTotal, 0)

        const summary2: HeartRateSummary = new HeartRateSummary(undefined,
            undefined, 0, undefined)
        assert.equal(summary2.outOfRangeTotal, 0)
        assert.equal(summary2.fatBurnTotal, 0)
        assert.equal(summary2.cardioTotal, 0)
        assert.equal(summary2.peakTotal, 0)
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj = {
            out_of_range_total: Math.floor(Math.random() * 1000),
            fat_burn_total: 0,
            cardio_total: Math.floor(Math.random() * 1000),
            peak_total: 0
        }
        const summary: HeartRateSummary = new HeartRateSummary(
            expectedObj.out_of_range_total, 0, expectedObj.cardio_total, 0)
        assert.deepEqual(summary.toJSON(), expectedObj)
    })
})
