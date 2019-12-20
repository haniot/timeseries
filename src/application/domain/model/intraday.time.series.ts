import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IntradayItem } from './intraday.item'
import { IntradaySummary } from './intraday.summary'
import { IntradayHeartRateSummary } from './intraday.heart.rate.summary'

export class IntradayTimeSeries implements IJSONSerializable {
    private _data_set: Array<IntradayItem>
    private _summary: IntradaySummary | IntradayHeartRateSummary
    private _type: string // steps, calories, distance, active_minutes or heart_rate
    private _patient_id?: string

    constructor(data_set: Array<IntradayItem>,
                summary: IntradaySummary | IntradayHeartRateSummary,
                type: string, patient_id: string) {
        this._data_set = data_set
        this._summary = summary
        this._type = type
        this._patient_id = patient_id
    }

    get data_set(): Array<IntradayItem> {
        return this._data_set
    }

    set data_set(value: Array<IntradayItem>) {
        this._data_set = value
    }

    get summary(): IntradaySummary | IntradayHeartRateSummary {
        return this._summary
    }

    set summary(value: IntradaySummary | IntradayHeartRateSummary) {
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
            data_set: this.data_set.map(item => item.toJSON()),
            summary: this.summary.toJSON()
        }
    }
}
