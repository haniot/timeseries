import { IJSONSerializable } from '../utils/json.serializable.interface'
import { HeartRateZoneData } from './heart.rate.zone.data'
import { HeartRateZoneType } from '../utils/heart.rate.zone.type'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

export class HeartRateZone implements IJSONSerializable, IJSONDeserializable<HeartRateZone> {
    private _outOfRange: HeartRateZoneData
    private _fatBurn: HeartRateZoneData
    private _cardio: HeartRateZoneData
    private _peak: HeartRateZoneData

    constructor(outOfRange?: HeartRateZoneData, fatBurn?: HeartRateZoneData, cardio?: HeartRateZoneData,
                peak?: HeartRateZoneData) {
        this._outOfRange = outOfRange ? outOfRange : new HeartRateZoneData()
        this._fatBurn = fatBurn ? fatBurn : new HeartRateZoneData()
        this._cardio = cardio ? cardio : new HeartRateZoneData()
        this._peak = peak ? peak : new HeartRateZoneData()
    }

    get outOfRange(): HeartRateZoneData {
        return this._outOfRange
    }

    set outOfRange(value: HeartRateZoneData) {
        value.type = HeartRateZoneType.OUT_OF_RANGE
        this._outOfRange = value
    }

    get fatBurn(): HeartRateZoneData {
        return this._fatBurn
    }

    set fatBurn(value: HeartRateZoneData) {
        value.type = HeartRateZoneType.FAT_BURN
        this._fatBurn = value
    }

    get cardio(): HeartRateZoneData {
        return this._cardio
    }

    set cardio(value: HeartRateZoneData) {
        value.type = HeartRateZoneType.CARDIO
        this._cardio = value
    }

    get peak(): HeartRateZoneData {
        return this._peak
    }

    set peak(value: HeartRateZoneData) {
        value.type = HeartRateZoneType.PEAK
        this._peak = value
    }

    public toJSON(): any {
        return {
            out_of_range: this.outOfRange.toJSON(),
            fat_burn: this.fatBurn.toJSON(),
            cardio: this.cardio.toJSON(),
            peak: this.peak.toJSON()
        }
    }

    public fromJSON(json: any): HeartRateZone {
        if (!json) return this

        if (json.out_of_range) {
            json.out_of_range.name = HeartRateZoneType.OUT_OF_RANGE
            this.outOfRange = new HeartRateZoneData().fromJSON(json.out_of_range)
        }

        if (json.fat_burn) {
            json.fat_burn.name = HeartRateZoneType.FAT_BURN
            this.fatBurn = new HeartRateZoneData().fromJSON(json.fat_burn)
        }

        if (json.cardio) {
            json.cardio.name = HeartRateZoneType.CARDIO
            this.cardio = new HeartRateZoneData().fromJSON(json.cardio)
        }

        if (json.peak) {
            json.peak.name = HeartRateZoneType.PEAK
            this.peak = new HeartRateZoneData().fromJSON(json.peak)
        }
        return this
    }
}
