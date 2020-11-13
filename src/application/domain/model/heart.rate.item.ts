import { IJSONSerializable } from '../utils/json.serializable.interface'
import { HeartRateZone } from './heart.rate.zone'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

export class HeartRateItem implements IJSONSerializable, IJSONDeserializable<HeartRateItem> {
    private _date: string
    private _value?: number
    private _zones: HeartRateZone

    constructor(date?: string, zones?: HeartRateZone, average?: number) {
        this._date = date ? date : ''
        this._zones = zones ? zones : new HeartRateZone()
        this._value = average
    }

    get date(): string {
        return this._date
    }

    set date(value: string) {
        this._date = value
    }

    get value(): number | undefined {
        return this._value
    }

    set value(value: number | undefined) {
        this._value = value
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
            value: this.value,
            zones: this.zones.toJSON()
        }
    }

    public fromJSON(json: any): HeartRateItem {
        if (!json) return this

        if (json.date) this.date = json.date
        if (json.value) this.value = json.value
        if (json.zones) this.zones = new HeartRateZone().fromJSON(json.zones)
        return this
    }
}
