import { IJSONSerializable } from '../utils/json.serializable.interface'

export class HeartRateZoneData implements IJSONSerializable {
    private _min: number // Minimum value of the heart rate zone.
    private _max: number // Maximum value of the heart rate zone.
    private _duration?: number  // Duration in the heart rate zone (given in milliseconds).
    private _calories?: number

    constructor(min: number, max: number, duration?: number, calories?: number) {
        this._min = min
        this._max = max
        this._duration = duration
        this._calories = calories
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

    get duration(): number | undefined {
        return this._duration
    }

    set duration(value: number | undefined) {
        this._duration = value
    }

    get calories(): number | undefined {
        return this._calories
    }

    set calories(value: number | undefined) {
        this._calories = value
    }

    public toJSON(): any {
        return {
            min: this.min,
            max: this.max,
            calories: this.calories,
            duration: this.duration
        }
    }
}
