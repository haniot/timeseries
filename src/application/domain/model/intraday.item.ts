import { IJSONSerializable } from '../utils/json.serializable.interface'

export class IntradayItem implements IJSONSerializable {
    private _time: string
    private _value: number

    constructor(time: string, value: number) {
        this._time = time
        this._value = value
    }

    get time(): string {
        return this._time
    }

    set time(value: string) {
        this._time = value
    }

    get value(): number {
        return this._value
    }

    set value(value: number) {
        this._value = value
    }

    public toJSON(): any {
        return {
            time: this.time,
            value: this.value
        }
    }
}
