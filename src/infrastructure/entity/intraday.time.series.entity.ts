import { IPoint } from 'influx'

export class IntradayTimeSeriesEntity {
    constructor(public points: Array<IPoint>, public pointsHrZones?: Array<IPoint>) {
        this.points = points
        this.pointsHrZones = pointsHrZones
    }
}
