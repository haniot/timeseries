import { assert } from 'chai'
import { IntradaySummary } from '../../../src/application/domain/model/intraday.summary'
import { Summary } from '../../../src/application/domain/model/summary'

describe('MODELS: Summary', () => {
    it('should return Summary object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj = {
            total: Math.floor(Math.random() * 1000)
        }

        const summary: Summary = new Summary(expectedObj.total)

        assert.equal(summary.total, expectedObj.total)
    })

    it('should return the populated Summary object with the attributes set by the set methods.', () => {
        const summary: Summary = new Summary()
        summary.total = 19562

        assert.equal(summary.total, 19562)
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const summary: Summary = new Summary()
        assert.equal(summary.total, 0)

        const summary2: IntradaySummary = new IntradaySummary(undefined)
        assert.equal(summary2.total, 0)
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const summary: Summary = new Summary(956)
        assert.deepEqual(summary.toJSON(), { total: 956 })
    })
})
