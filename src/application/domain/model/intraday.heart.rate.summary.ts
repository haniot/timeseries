import { IJSONSerializable } from '../utils/json.serializable.interface'
import { HeartRateZone } from './heart.rate.zone'

export class IntradayHeartRateSummary implements IJSONSerializable {
    private _start_time: string
    private _end_time: string
    private _min: number
    private _max: number
    private _average: number
    private _interval: string  // 1sec, 1min, etc
    private _zones: HeartRateZone

    constructor(start_time: string, end_time: string,
                min: number, max: number, average: number,
                interval: string, zones: HeartRateZone) {
        this._start_time = start_time
        this._end_time = end_time
        this._min = min
        this._max = max
        this._average = average
        this._interval = interval
        this._zones = zones
    }

    get start_time(): string {
        return this._start_time
    }

    set start_time(value: string) {
        this._start_time = value
    }

    get end_time(): string {
        return this._end_time
    }

    set end_time(value: string) {
        this._end_time = value
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
            start_time: this.start_time,
            end_time: this.end_time,
            min: this.min,
            max: this.max,
            average: this.average,
            interval: this.interval,
            zones: this.zones.toJSON()
        }
    }
}
