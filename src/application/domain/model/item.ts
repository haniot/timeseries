import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

export class Item implements IJSONSerializable, IJSONDeserializable<Item> {
    private _date: string
    private _value: number

    constructor(date?: string, value?: number) {
        this._date = date ? date : ''
        this._value = value !== undefined ? value : 0
    }

    get date(): string {
        return this._date
    }

    set date(value: string) {
        this._date = value
    }

    get value(): number {
        return this._value
    }

    set value(value: number) {
        this._value = value
    }

    public toJSON(): any {
        return {
            date: this.date,
            value: this.value
        }
    }

    public fromJSON(json: any): Item {
        if (!json) return this

        // The value attribute will not be checked if it is different from undefined,
        // because in the constructor this has already been done.

        if (json.date) this.date = json.date
        if (json.value !== undefined) this.value = json.value
        return this
    }
}
