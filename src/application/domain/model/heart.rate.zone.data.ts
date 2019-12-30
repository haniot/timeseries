import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

export class HeartRateZoneData implements IJSONSerializable, IJSONDeserializable<HeartRateZoneData> {
    private _min: number // Minimum value of the heart rate zone.
    private _max: number // Maximum value of the heart rate zone.
    private _duration: number  // Duration in the heart rate zone (given in milliseconds).
    private _calories: number
    private _type?: string // Zone name

    constructor(min?: number, max?: number, duration?: number, calories?: number, type?: string) {
        this._min = min !== undefined ? min : 0
        this._max = max !== undefined ? max : 0
        this._duration = duration !== undefined ? duration : 0
        this._calories = calories !== undefined ? calories : 0
        this._type = type ? type : ''
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

    get duration(): number {
        return this._duration
    }

    set duration(value: number) {
        this._duration = value
    }

    get calories(): number {
        return this._calories
    }

    set calories(value: number) {
        this._calories = value
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value
    }

    public toJSON(): any {
        return {
            min: this.min,
            max: this.max,
            calories: this.calories,
            duration: this.duration
        }
    }

    public fromJSON(json: any): HeartRateZoneData {
        if (!json) return this

        if (json.min !== undefined) this.min = json.min
        if (json.max !== undefined) this.max = json.max
        if (json.duration !== undefined) this.duration = json.duration
        if (json.calories !== undefined) this.calories = json.calories
        if (json.type) this.type = json.type
        return this
    }
}
