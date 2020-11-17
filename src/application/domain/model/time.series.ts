import { Item } from './item'
import { Summary } from './summary'
import { HeartRateItem } from './heart.rate.item'
import { HeartRateSummary } from './heart.rate.summary'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { TimeSeriesType } from '../utils/time.series.type'

export class TimeSeries implements IJSONSerializable, IJSONDeserializable<TimeSeries> {
    private _summary: Summary | HeartRateSummary
    private _dataSet: Array<Item | HeartRateItem>
    private _type: string // steps, calories, distance, active_minutes or heart_rate
    private _patientId: string

    constructor(type?: string,
                dataSet?: Array<Item | HeartRateItem>,
                summary?: Summary | HeartRateSummary,
                patientId?: string) {
        this._type = type ? type : ''
        this._dataSet = dataSet ? dataSet : []
        this._summary = summary ? summary : new Summary()
        this._patientId = patientId ? patientId : ''
    }

    get dataSet(): Array<Item | HeartRateItem> {
        return this._dataSet
    }

    set dataSet(value: Array<Item | HeartRateItem>) {
        this._dataSet = value
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

    get patientId(): string {
        return this._patientId
    }

    set patientId(value: string) {
        this._patientId = value
    }

    public toJSON(): any {
        return {
            summary: this.summary.toJSON(),
            data_set: this.dataSet.map(item => item.toJSON())
        }
    }

    public fromJSON(json: any): TimeSeries {
        if (!json) return this

        if (JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.user_id) this.patientId = json.user_id
        if (json.type) {
            this.type = json.type

            if (!(json.data_set instanceof Array)) return this

            // build data set
            if (this.type !== TimeSeriesType.HEART_RATE) {
                this.dataSet = json.data_set.map(item => new Item().fromJSON(item))
            } else {
                this.dataSet = json.data_set.map(item => new HeartRateItem().fromJSON(item))
            }
        }
        return this
    }
}
