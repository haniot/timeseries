import { IJSONSerializable } from '../utils/json.serializable.interface'
import { HeartRateZoneData } from './heart.rate.zone.data'

export class HeartRateZone implements IJSONSerializable {
    private _fat_burn: HeartRateZoneData
    private _cardio: HeartRateZoneData
    private _peak: HeartRateZoneData
    private _out_of_range: HeartRateZoneData

    constructor(fat_burn: HeartRateZoneData, cardio: HeartRateZoneData,
                peak: HeartRateZoneData, out_of_range: HeartRateZoneData) {
        this._fat_burn = fat_burn
        this._cardio = cardio
        this._peak = peak
        this._out_of_range = out_of_range
    }

    get fat_burn(): HeartRateZoneData {
        return this._fat_burn
    }

    set fat_burn(value: HeartRateZoneData) {
        this._fat_burn = value
    }

    get cardio(): HeartRateZoneData {
        return this._cardio
    }

    set cardio(value: HeartRateZoneData) {
        this._cardio = value
    }

    get peak(): HeartRateZoneData {
        return this._peak
    }

    set peak(value: HeartRateZoneData) {
        this._peak = value
    }

    get out_of_range(): HeartRateZoneData {
        return this._out_of_range
    }

    set out_of_range(value: HeartRateZoneData) {
        this._out_of_range = value
    }

    public toJSON(): any {
        return {
            fat_burn: this.fat_burn.toJSON(),
            cardio: this.cardio.toJSON(),
            peak: this.peak.toJSON(),
            out_of_range: this.out_of_range.toJSON()
        }
    }
}
