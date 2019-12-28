import { IJSONSerializable } from '../utils/json.serializable.interface'
import { TimeSeries } from './time.series'
import { TimeSeriesType } from '../utils/time.series.type'

export class TimeSeriesGroup implements IJSONSerializable {
    private _steps: TimeSeries
    private _calories: TimeSeries
    private _distance: TimeSeries
    private _activeMinutes: TimeSeries

    constructor(steps?: TimeSeries, calories?: TimeSeries, distance?: TimeSeries, activeMinutes?: TimeSeries) {
        this._steps = steps ? steps : new TimeSeries(TimeSeriesType.STEPS)
        this._calories = calories ? calories : new TimeSeries(TimeSeriesType.CALORIES)
        this._distance = distance ? distance : new TimeSeries(TimeSeriesType.DISTANCE)
        this._activeMinutes = activeMinutes ? activeMinutes : new TimeSeries(TimeSeriesType.ACTIVE_MINUTES)
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

    get activeMinutes(): TimeSeries {
        return this._activeMinutes
    }

    set activeMinutes(value: TimeSeries) {
        this._activeMinutes = value
    }

    public toJSON(): any {
        return {
            steps: this._steps.toJSON(),
            calories: this._calories.toJSON(),
            distance: this._distance.toJSON(),
            active_minutes: this._activeMinutes.toJSON()
        }
    }
}
