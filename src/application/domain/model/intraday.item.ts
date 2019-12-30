import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

export class IntradayItem implements IJSONSerializable, IJSONDeserializable<IntradayItem> {
    private _time: string
    private _value: number

    constructor(time?: string, value?: number) {
        this._time = time ? time : ''
        this._value = value !== undefined ? value : 0
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

    public fromJSON(json: any): IntradayItem {
        if (!json) return this

        if (json.time) this.time = json.time
        if (json.value !== undefined) this.value = json.value
        return this
    }
}
