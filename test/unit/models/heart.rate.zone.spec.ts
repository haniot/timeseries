import { assert } from 'chai'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'
import { HeartRateZoneData } from '../../../src/application/domain/model/heart.rate.zone.data'

describe('MODELS: HeartRateZone', () => {
    it('should return HeartRateZone object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj = {
            out_of_range: new HeartRateZoneData(30, 91, 150000, 22.0000, 'out_of_range'),
            fat_burn: new HeartRateZoneData(91, 127, 120000, 41.1500, 'fat_burn'),
            cardio: new HeartRateZoneData(127, 154, 10000, 15, 'cardio'),
            peak: new HeartRateZoneData(154, 220, 135000, 22.0963, 'peak')
        }

        const heartRateZone: HeartRateZone = new HeartRateZone(
            expectedObj.out_of_range, expectedObj.fat_burn, expectedObj.cardio, expectedObj.peak
        )
        assert.deepEqual(heartRateZone.outOfRange, expectedObj.out_of_range)
        assert.deepEqual(heartRateZone.fatBurn, expectedObj.fat_burn)
        assert.deepEqual(heartRateZone.cardio, expectedObj.cardio)
        assert.deepEqual(heartRateZone.peak, expectedObj.peak)
    })

    it('should return the populated HeartRateZone object with the attributes set by the set methods.', () => {
        const heartRateZone: HeartRateZone = new HeartRateZone()
        heartRateZone.outOfRange = new HeartRateZoneData(30, 91, 150000, 22.0000, 'out_of_range')
        heartRateZone.fatBurn = new HeartRateZoneData(91, 127, 120000, 41.1500, 'fat_burn')
        heartRateZone.cardio = new HeartRateZoneData(127, 154, 10000, 15, 'cardio')
        heartRateZone.peak = new HeartRateZoneData(154, 220, 135000, 22.0963, 'peak')

        assert.deepEqual(heartRateZone.outOfRange, new HeartRateZoneData(30, 91,
            150000, 22.0000, 'out_of_range'))
        assert.deepEqual(heartRateZone.fatBurn, new HeartRateZoneData(91, 127,
            120000, 41.1500, 'fat_burn'))
        assert.deepEqual(heartRateZone.cardio, new HeartRateZoneData(127, 154,
            10000, 15, 'cardio'))
        assert.deepEqual(heartRateZone.peak, new HeartRateZoneData(154, 220,
            135000, 22.0963, 'peak'))
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const heartRateZone: HeartRateZone = new HeartRateZone()

        assert.deepEqual(heartRateZone.outOfRange, new HeartRateZoneData())
        assert.deepEqual(heartRateZone.fatBurn, new HeartRateZoneData())
        assert.deepEqual(heartRateZone.cardio, new HeartRateZoneData())
        assert.deepEqual(heartRateZone.peak, new HeartRateZoneData())

        const fatBurn = new HeartRateZoneData(91, 127, 120000, 41.1500, 'fat_burn')
        const heartRateZone2: HeartRateZone = new HeartRateZone(undefined, fatBurn)
        assert.deepEqual(heartRateZone2.outOfRange, new HeartRateZoneData())
        assert.deepEqual(heartRateZone2.fatBurn, fatBurn)
        assert.deepEqual(heartRateZone.cardio, new HeartRateZoneData())
        assert.deepEqual(heartRateZone.peak, new HeartRateZoneData())
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const outOfRange: HeartRateZoneData = new HeartRateZoneData(30, 91,
            150000, 22.0000, 'out_of_range')
        const fatBurn: HeartRateZoneData = new HeartRateZoneData(91, 127,
            120000, 41.1500, 'fat_burn')
        const cardio: HeartRateZoneData = new HeartRateZoneData(127, 154,
            10000, 15, 'cardio')
        const peak: HeartRateZoneData = new HeartRateZoneData(154, 220,
            135000, 22.0963, 'peak')

        const expectedObj = {
            out_of_range: outOfRange.toJSON(),
            fat_burn: fatBurn.toJSON(),
            cardio: cardio.toJSON(),
            peak: peak.toJSON()
        }

        const heartRateZone: HeartRateZone = new HeartRateZone(outOfRange, fatBurn, cardio, peak)
        assert.deepEqual(heartRateZone.toJSON(), expectedObj)
    })

    it('should return HeartRateZone object according to parameter passed in function fromJSON(json).', () => {
        const expectedObj: HeartRateZone = new HeartRateZone(
            new HeartRateZoneData(30, 91, 150000, 22.0000, 'out_of_range'),
            new HeartRateZoneData(91, 127, 120000, 41.1500, 'fat_burn'),
            new HeartRateZoneData(127, 154, 10000, 15, 'cardio'),
            new HeartRateZoneData(154, 220, 135000, 22.0963, 'peak')
        )

        const json = {
            out_of_range: expectedObj.outOfRange.toJSON(),
            fat_burn: expectedObj.fatBurn.toJSON(),
            cardio: expectedObj.cardio.toJSON(),
            peak: expectedObj.peak.toJSON()
        }

        assert.deepEqual(new HeartRateZone().fromJSON(json), expectedObj)
    })

    it('should return default HeartRateZone object when parameter passed in function fromJSON(json) is empty.', () => {
        assert.deepEqual(new HeartRateZone().fromJSON({}), new HeartRateZone())
        assert.deepEqual(new HeartRateZone().fromJSON(undefined), new HeartRateZone())
        assert.deepEqual(new HeartRateZone().fromJSON(''), new HeartRateZone())
        assert.deepEqual(new HeartRateZone().fromJSON(null), new HeartRateZone())
    })
})
