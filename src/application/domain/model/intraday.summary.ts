import { IJSONSerializable } from '../utils/json.serializable.interface'

export class IntradaySummary implements IJSONSerializable {
    private _start_time: string
    private _end_time: string
    private _total: number
    private _interval: string // 1sec, 1min, etc

    constructor(start_time: string, end_time: string, total: number, interval: string) {
        this._start_time = start_time
        this._end_time = end_time
        this._total = total
        this._interval = interval
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
            start_time: this.start_time,
            end_time: this.end_time,
            total: this.total,
            interval: this.interval
        }
    }
}
