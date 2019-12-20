import { IJSONSerializable } from '../utils/json.serializable.interface'
import { HeartRateZone } from './heart.rate.zone'

export class HeartRateItem implements IJSONSerializable {
    private _date: string
    private _zones: HeartRateZone

    constructor(date: string, zones: HeartRateZone) {
        this._date = date
        this._zones = zones
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
}
