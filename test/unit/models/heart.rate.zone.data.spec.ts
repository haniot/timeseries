import { assert } from 'chai'
import { HeartRateZoneData } from '../../../src/application/domain/model/heart.rate.zone.data'

describe('MODELS: HeartRateZoneData', () => {
    it('should return HeartRateZoneData object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj: any = {
            min: Math.floor(Math.random() * 100),
            duration: Math.floor(Math.random() * 50000),
            calories: Math.floor(Math.random() * 50000),
            type: (['out_of_range', 'fat_burn', 'cardio', 'peak'][Math.floor(Math.random() * 4)])
        }
        expectedObj.max = expectedObj.min + Math.floor(Math.random() * 100)

        const hrData: HeartRateZoneData = new HeartRateZoneData(
            expectedObj.min, expectedObj.max, expectedObj.duration, expectedObj.calories, expectedObj.type
        )

        assert.equal(hrData.min, expectedObj.min)
        assert.equal(hrData.max, expectedObj.max)
        assert.equal(hrData.duration, expectedObj.duration)
        assert.equal(hrData.calories, expectedObj.calories)
        assert.equal(hrData.type, expectedObj.type)
    })

    it('should return the populated HeartRateZoneData object with the attributes set by the set methods.', () => {
        const hrData: HeartRateZoneData = new HeartRateZoneData()
        hrData.min = 91
        hrData.max = 120
        hrData.duration = 1600
        hrData.calories = 0.888
        hrData.type = 'fat_burn'

        assert.equal(hrData.min, 91)
        assert.equal(hrData.max, 120)
        assert.equal(hrData.duration, 1600)
        assert.equal(hrData.calories, 0.888)
        assert.equal(hrData.type, 'fat_burn')
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const hrData: HeartRateZoneData = new HeartRateZoneData()

        assert.equal(hrData.min, 0)
        assert.equal(hrData.max, 0)
        assert.equal(hrData.duration, 0)
        assert.equal(hrData.calories, 0)
        assert.equal(hrData.type, '')

        const hrData2: HeartRateZoneData = new HeartRateZoneData(30, 91,
            15000, undefined, 'out_of_range')

        assert.equal(hrData2.min, 30)
        assert.equal(hrData2.max, 91)
        assert.equal(hrData2.duration, 15000)
        assert.equal(hrData2.calories, 0)
        assert.equal(hrData2.type, 'out_of_range')
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj: any = {
            min: Math.floor(Math.random() * 100),
            duration: Math.floor(Math.random() * 50000),
            calories: Math.floor(Math.random() * 50000)
        }
        expectedObj.max = expectedObj.min + Math.floor(Math.random() * 100)

        const hrData: HeartRateZoneData = new HeartRateZoneData(
            expectedObj.min, expectedObj.max, expectedObj.duration, expectedObj.calories, 'cardio'
        )
        assert.deepEqual(hrData.toJSON(), expectedObj)
    })

    it('should return HeartRateZoneData object according to parameter passed in function fromJSON(json).', () => {
        const expectedObj: HeartRateZoneData = new HeartRateZoneData(
            91, 129, 155001, 1500.46511, 'fat_burn'
        )

        const json: any = {
            min: 91,
            max: 129,
            duration: 155001,
            calories: 1500.46511,
            type: 'fat_burn'
        }

        assert.deepEqual(new HeartRateZoneData().fromJSON(json), expectedObj)
    })

    it('should return default HeartRateZoneData object when parameter passed in function fromJSON(json) is empty.', () => {
        assert.deepEqual(new HeartRateZoneData().fromJSON({}), new HeartRateZoneData())
        assert.deepEqual(new HeartRateZoneData().fromJSON(undefined), new HeartRateZoneData())
        assert.deepEqual(new HeartRateZoneData().fromJSON(''), new HeartRateZoneData())
        assert.deepEqual(new HeartRateZoneData().fromJSON(null), new HeartRateZoneData())
    })
})
