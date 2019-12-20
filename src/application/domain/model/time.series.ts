import { IJSONSerializable } from '../utils/json.serializable.interface'
import { HeartRateItem } from './heart.rate.item'
import { Item } from './item'
import { Summary } from './summary'
import { HeartRateSummary } from './heart.rate.summary'

export class TimeSeries implements IJSONSerializable {
    private _summary: Summary | HeartRateSummary
    private _data_set: Array<Item | HeartRateItem>
    private _type: string // steps, calories, distance, active_minutes or heart_rate
    private _patient_id?: string

    constructor(summary: Summary | HeartRateSummary, type: string,
                data_set: Array<Item | HeartRateItem>) {
        this._data_set = data_set
        this._summary = summary
        this._type = type
    }

    get data_set(): Array<Item | HeartRateItem> {
        return this._data_set
    }

    set data_set(value: Array<Item | HeartRateItem>) {
        this._data_set = value
    }

    get summary(): Summary | HeartRateSummary {
        return this._summary
    }

    set summary(value: Summary | HeartRateSummary) {
        this._summary = value
    }

    get type(): string {
        return this._type
    }

    set type(value: string) {
        this._type = value
    }

    get patient_id(): string | undefined {
        return this._patient_id
    }

    set patient_id(value: string | undefined) {
        this._patient_id = value
    }

    public toJSON(): any {
        return {
            summary: this.summary.toJSON(),
            data_set: this.data_set.map(item => item.toJSON())
        }
    }
}
