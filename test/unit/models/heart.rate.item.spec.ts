import { assert } from 'chai'
import { HeartRateItem } from '../../../src/application/domain/model/heart.rate.item'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'
import { HeartRateZoneData } from '../../../src/application/domain/model/heart.rate.zone.data'
import { HeartRateZoneType } from '../../../src/application/domain/utils/heart.rate.zone.type'

describe('MODELS: HeartRateItem', () => {
    const hrZones: HeartRateZone = new HeartRateZone(
        new HeartRateZoneData(30, 91, 150000, 22.0000, HeartRateZoneType.OUT_OF_RANGE),
        new HeartRateZoneData(91, 127, 120000, 41.1500, HeartRateZoneType.FAT_BURN),
        new HeartRateZoneData(127, 154, 10000, 15, HeartRateZoneType.CARDIO),
        new HeartRateZoneData(154, 220, 135000, 22.0963, HeartRateZoneType.PEAK)
    )

    it('should return HeartRateItem object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj = {
            date: new Date().toISOString().split('T')[0],
            value: 130,
            zones: hrZones
        }
        const item: HeartRateItem = new HeartRateItem(expectedObj.date, expectedObj.zones, 130)

        assert.equal(item.date, expectedObj.date)
        assert.deepEqual(item.zones, expectedObj.zones)
    })

    it('should return the populated HeartRateItem object with the attributes set by the set methods.', () => {
        const item: HeartRateItem = new HeartRateItem()
        item.date = '2019-12-01'
        item.zones = hrZones
        item.value = 125

        assert.equal(item.date, '2019-12-01')
        assert.equal(item.value, 125)
        assert.deepEqual(item.zones.outOfRange, hrZones.outOfRange)
        assert.deepEqual(item.zones.fatBurn, hrZones.fatBurn)
        assert.deepEqual(item.zones.cardio, hrZones.cardio)
        assert.deepEqual(item.zones.peak, hrZones.peak)
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const item: HeartRateItem = new HeartRateItem()

        assert.equal(item.date, '')
        assert.equal(item.value, undefined)
        assert.deepEqual(item.zones, new HeartRateZone())
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj = {
            date: '2019-10-25',
            value: 150,
            zones: hrZones.toJSON()
        }
        assert.deepEqual(new HeartRateItem('2019-10-25', hrZones, 150).toJSON(), expectedObj)
    })

    it('should return HeartRateItem object according to parameter passed in function fromJSON(json).', () => {
        const date: string = new Date().toISOString().split('T')[0]
        const expectedObj: HeartRateItem = new HeartRateItem(date, hrZones, 150)
        const json: any = {
            date,
            value: 150,
            zones: {
                out_of_range: hrZones.outOfRange,
                fat_burn: hrZones.fatBurn,
                cardio: hrZones.cardio,
                peak: hrZones.peak
            }
        }
        assert.deepEqual(new HeartRateItem().fromJSON(json), expectedObj)
    })

    it('should return default HeartRateItem object when parameter passed in function fromJSON(json) is empty.', () => {
        assert.deepEqual(new HeartRateItem().fromJSON({}), new HeartRateItem())
        assert.deepEqual(new HeartRateItem().fromJSON(undefined), new HeartRateItem())
        assert.deepEqual(new HeartRateItem().fromJSON(''), new HeartRateItem())
        assert.deepEqual(new HeartRateItem().fromJSON(null), new HeartRateItem())
    })
})
