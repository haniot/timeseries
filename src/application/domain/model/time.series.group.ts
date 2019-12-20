import { IJSONSerializable } from '../utils/json.serializable.interface'
import { TimeSeries } from './time.series'

export class TimeSeriesGroup implements IJSONSerializable {
    private _steps: TimeSeries
    private _calories: TimeSeries
    private _distance: TimeSeries
    private _active_minutes: TimeSeries

    constructor(steps: TimeSeries, calories: TimeSeries, distance: TimeSeries, active_minutes: TimeSeries) {
        this._steps = steps
        this._calories = calories
        this._distance = distance
        this._active_minutes = active_minutes
    }

    get steps(): TimeSeries {
        return this._steps
    }

    set steps(value: TimeSeries) {
        this._steps = value
    }

    get calories(): TimeSeries {
        return this._calories
    }

    set calories(value: TimeSeries) {
        this._calories = value
    }

    get distance(): TimeSeries {
        return this._distance
    }

    set distance(value: TimeSeries) {
        this._distance = value
    }

    get active_minutes(): TimeSeries {
        return this._active_minutes
    }

    set active_minutes(value: TimeSeries) {
        this._active_minutes = value
    }

    public toJSON(): any {
        return {
            steps: this._steps.toJSON(),
            calories: this._calories.toJSON(),
            distance: this._distance.toJSON(),
            active_minutes: this._active_minutes.toJSON()
        }
    }
}
