import { IJSONSerializable } from '../utils/json.serializable.interface'

export class IntradaySummary implements IJSONSerializable {
    private _startTime: string
    private _endTime: string
    private _total: number
    private _interval: string // 1sec, 1min, etc

    constructor(startTime?: string, endTime?: string, total?: number, interval?: string) {
        this._startTime = startTime ? startTime : ''
        this._endTime = endTime ? endTime : ''
        this._total = total !== undefined ? total : 0
        this._interval = interval ? interval : ''
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

    get total(): number {
        return this._total
    }

    set total(value: number) {
        this._total = value
    }

    get interval(): string {
        return this._interval
    }

    set interval(value: string) {
        this._interval = value
    }

    public toJSON(): any {
        return {
            start_time: this.startTime,
            end_time: this.endTime,
            total: this.total,
            interval: this.interval
        }
    }
}
