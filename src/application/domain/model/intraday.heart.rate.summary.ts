import { IJSONSerializable } from '../utils/json.serializable.interface'
import { HeartRateZone } from './heart.rate.zone'

export class IntradayHeartRateSummary implements IJSONSerializable {
    private _startTime: string
    private _endTime: string
    private _min: number
    private _max: number
    private _average: number
    private _interval: string  // 1sec, 1min, etc
    private _zones: HeartRateZone

    constructor(startTime?: string, endTime?: string,
                min?: number, max?: number, average?: number,
                interval?: string, zones?: HeartRateZone) {
        this._startTime = startTime ? startTime : ''
        this._endTime = endTime ? endTime : ''
        this._min = min !== undefined ? min : 0
        this._max = max !== undefined ? max : 0
        this._average = average !== undefined ? average : 0
        this._interval = interval ? interval : ''
        this._zones = zones ? zones : new HeartRateZone()
    }

    get startTime(): string {
        return this._startTime
    }

    set startTime(value: string) {
        this._startTime = value
    }

    get endTime(): string {
        return this._endTime
    }

    set endTime(value: string) {
        this._endTime = value
    }

    get min(): number {
        return this._min
    }

    set min(value: number) {
        this._min = value
    }

    get max(): number {
        return this._max
    }

    set max(value: number) {
        this._max = value
    }

    get average(): number {
        return this._average
    }

    set average(value: number) {
        this._average = value
    }

    get interval(): string {
        return this._interval
    }

    set interval(value: string) {
        this._interval = value
    }

    get zones(): HeartRateZone {
        return this._zones
    }

    set zones(value: HeartRateZone) {
        this._zones = value
    }

    public toJSON(): any {
        return {
            start_time: this.startTime,
            end_time: this.endTime,
            min: this.min,
            max: this.max,
            average: this.average,
            interval: this.interval,
            zones: this.zones.toJSON()
        }
    }
}
