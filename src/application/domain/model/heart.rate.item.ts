import { IJSONSerializable } from '../utils/json.serializable.interface'
import { HeartRateZone } from './heart.rate.zone'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

export class HeartRateItem implements IJSONSerializable, IJSONDeserializable<HeartRateItem> {
    private _date: string
    private _zones: HeartRateZone

        constructor(date?: string, zones?: HeartRateZone) {
        this._date = date ? date : ''
        this._zones = zones ? zones : new HeartRateZone()
    }

    get date(): string {
        return this._date
    }

    set date(value: string) {
        this._date = value
    }

    get zones(): HeartRateZone {
        return this._zones
    }

    set zones(value: HeartRateZone) {
        this._zones = value
    }

    public toJSON(): any {
        return {
            date: this.date,
            zones: this.zones.toJSON()
        }
    }

    public fromJSON(json: any): HeartRateItem {
        if (!json) return this

        if (json.date) this.date = json.date
        if (json.zones) this.zones = new HeartRateZone().fromJSON(json.zones)
        return this
    }
}
