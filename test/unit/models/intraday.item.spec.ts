import { assert } from 'chai'
import { IntradayItem } from '../../../src/application/domain/model/intraday.item'

describe('MODELS: IntradayItem', () => {
    it('should return IntradayItem object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj = {
            time: new Date().toISOString(),
            value: Math.floor(Math.random() * 1000)
        }
        const intradayItem: IntradayItem = new IntradayItem(expectedObj.time, expectedObj.value)

        assert.equal(intradayItem.time, expectedObj.time)
        assert.equal(intradayItem.value, expectedObj.value)
    })

    it('should return the populated IntradayItem object with the attributes set by the set methods.', () => {
        const intradayItem: IntradayItem = new IntradayItem()
        intradayItem.time = '2019-06-08T00:00:00.000Z'
        intradayItem.value = 10

        assert.equal(intradayItem.time, '2019-06-08T00:00:00.000Z')
        assert.equal(intradayItem.value, 10)
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const intradayItem: IntradayItem = new IntradayItem()

        assert.equal(intradayItem.time, '')
        assert.equal(intradayItem.value, 0)

        const intradayItem2: IntradayItem = new IntradayItem(undefined, 10)
        assert.equal(intradayItem2.time, '')
        assert.equal(intradayItem2.value, 10)
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj = {
            time: new Date().toISOString(),
            value: Math.floor(Math.random() * 1000)
        }
        assert.deepEqual(new IntradayItem(expectedObj.time, expectedObj.value).toJSON(), expectedObj)
    })

    it('should return IntradayItem object according to parameter passed in function fromJSON(json).', () => {
        const time: string = new Date().toISOString()
        const value: number = Math.floor(Math.random() * 1000)
        const expectedObj: IntradayItem = new IntradayItem(time, value)
        const json = { time, value }

        assert.deepEqual(new IntradayItem().fromJSON(json), expectedObj)
    })

    it('should return default IntradayItem object when parameter passed in function fromJSON(json) is empty.', () => {
        assert.deepEqual(new IntradayItem().fromJSON({}), new IntradayItem())
        assert.deepEqual(new IntradayItem().fromJSON(undefined), new IntradayItem())
        assert.deepEqual(new IntradayItem().fromJSON(''), new IntradayItem())
        assert.deepEqual(new IntradayItem().fromJSON(null), new IntradayItem())
    })
})
