import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IntradayItem } from './intraday.item'
import { IntradaySummary } from './intraday.summary'
import { IntradayHeartRateSummary } from './intraday.heart.rate.summary'
import { JsonUtils } from '../utils/json.utils'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { TimeSeriesType } from '../utils/time.series.type'
import { HeartRateZone } from './heart.rate.zone'

export class IntradayTimeSeries implements IJSONSerializable, IJSONDeserializable<IntradayTimeSeries> {
    private _dataSet: Array<IntradayItem>
    private _summary: IntradaySummary | IntradayHeartRateSummary
    private _type: string // steps, calories, distance, active_minutes or heart_rate
    private _patientId: string

    constructor(type?: string, dataSet?: Array<IntradayItem>,
                summary?: IntradaySummary | IntradayHeartRateSummary,
                patientId?: string) {
        this._type = type ? type : ''
        this._dataSet = dataSet ? dataSet : []
        this._summary = summary ? summary : new IntradaySummary()
        this._patientId = patientId ? patientId : ''
    }

    get dataSet(): Array<IntradayItem> {
        return this._dataSet
    }

    set dataSet(value: Array<IntradayItem>) {
        this._dataSet = value
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

    public fromJSON(json: any): IntradayTimeSeries {
        if (!json) return this

        if (JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.patient_id) this.patientId = json.patient_id
        if (json.type) this.type = json.type

        // build data set
        if (json.data_set instanceof Array) {
            this.dataSet = json.data_set.map(item => new IntradayItem().fromJSON(item))
        }

        // build summary
        if (this.type === TimeSeriesType.HEART_RATE) {
            this.summary = new IntradayHeartRateSummary()
            this.summary.zones = new HeartRateZone().fromJSON(json.zones)
        }
        if (json.start_time) this.summary.startTime! = json.start_time
        if (json.end_time) this.summary.endTime! = json.end_time
        return this
    }
}
