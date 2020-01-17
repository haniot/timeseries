import { assert } from 'chai'
import { Item } from '../../../src/application/domain/model/item'

describe('MODELS: Item', () => {
    it('should return Item object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj = {
            date: new Date().toISOString().split('T')[0],
            value: Math.floor(Math.random() * 1000)
        }
        const item: Item = new Item(expectedObj.date, expectedObj.value)

        assert.equal(item.date, expectedObj.date)
        assert.equal(item.value, expectedObj.value)
    })

    it('should return the populated Item object with the attributes set by the set methods.', () => {
        const item: Item = new Item()
        item.date = '2019-06-08'
        item.value = 10

        assert.equal(item.date, '2019-06-08')
        assert.equal(item.value, 10)
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const item: Item = new Item()

        assert.equal(item.date, '')
        assert.equal(item.value, 0)

        const item2: Item = new Item(undefined, 10)
        assert.equal(item2.date, '')
        assert.equal(item2.value, 10)
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj = {
            date: new Date().toISOString().split('T')[0],
            value: Math.floor(Math.random() * 1000)
        }
        assert.deepEqual(new Item(expectedObj.date, expectedObj.value).toJSON(), expectedObj)
    })

    it('should return Item object according to parameter passed in function fromJSON(json).', () => {
        const date: string = new Date().toISOString().split('T')[0]
        const value: number = Math.floor(Math.random() * 1000)
        const expectedObj: Item = new Item(date, value)
        const json = { date, value }

        assert.deepEqual(new Item().fromJSON(json), expectedObj)
    })

    it('should return default Item object when parameter passed in function fromJSON(json) is empty.', () => {
        assert.deepEqual(new Item().fromJSON({}), new Item())
        assert.deepEqual(new Item().fromJSON(undefined), new Item())
        assert.deepEqual(new Item().fromJSON(''), new Item())
        assert.deepEqual(new Item().fromJSON(null), new Item())
    })
})
