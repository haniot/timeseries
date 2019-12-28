import { IPoint } from 'influx'

export class TimeSeriesEntity {
    constructor(public points: Array<IPoint>) {
        this.points = points
    }
}
