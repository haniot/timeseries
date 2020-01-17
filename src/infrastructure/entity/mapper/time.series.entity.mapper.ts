import moment from 'moment'
import { IPoint } from 'influx'
import { injectable } from 'inversify'
import { TimeSeries } from '../../../application/domain/model/time.series'
import { TimeSeriesEntity } from '../time.series.entity'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Summary } from '../../../application/domain/model/summary'
import { Item } from '../../../application/domain/model/item'
import { TimeSeriesType } from '../../../application/domain/utils/time.series.type'
import { HeartRateSummary } from '../../../application/domain/model/heart.rate.summary'
import { HeartRateItem } from '../../../application/domain/model/heart.rate.item'
import { HeartRateZone } from '../../../application/domain/model/heart.rate.zone'
import { HeartRateZoneData } from '../../../application/domain/model/heart.rate.zone.data'
import { HeartRateZoneType } from '../../../application/domain/utils/heart.rate.zone.type'
import { Default } from '../../../utils/default'

@injectable()
export class TimeSeriesEntityMapper implements IEntityMapper<TimeSeries, TimeSeriesEntity> {
    public transform(item: any): any {
        if (item instanceof TimeSeries) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Transforms application layer object into database format object.
     *
     * @param item
     */
    public modelToModelEntity(item: TimeSeries): TimeSeriesEntity {
        if (item.type !== TimeSeriesType.HEART_RATE) {
            return new TimeSeriesEntity(this.buildPoints(item))
        }
        return new TimeSeriesEntity(this.buildHeartRatePoints(item))
    }

    /**
     * Transforms database query result into application layer object.
     *
     * @param json
     */
    public jsonToModel(json: any): TimeSeries {
        if (json.type !== TimeSeriesType.HEART_RATE) {
            return this.transformTimeSeries(json)
        }
        return this.transformHeartRateTimeSeries(json)
    }

    /**
     * Builds an IPoint object representing the steps, calories, distance or active_minutes measurement.
     *
     * @param item
     */
    private buildPoints(item: TimeSeries): Array<IPoint> {
        return item.dataSet.map((entry: any) => {
            return {
                measurement: Default.MEASUREMENT_TIMESERIES_NAME,
                fields: { value: entry.value },
                tags: {
                    user_id: item.patientId,
                    type: item.type
                },
                timestamp: new Date(entry.date).getTime() * 1e+6
            }
        }, [])
    }

    /**
     * Builds IPoint Type Array Representing Heart Rate measurements.
     * @param item
     */
    private buildHeartRatePoints(item: TimeSeries): Array<IPoint> {
        const points: Array<IPoint> = []
        item.dataSet.forEach((elem) => {
            elem = elem as HeartRateItem
            points.push(this.buildHeartRateZonePoint(elem.zones.outOfRange, elem.date, item.patientId))
            points.push(this.buildHeartRateZonePoint(elem.zones.fatBurn, elem.date, item.patientId))
            points.push(this.buildHeartRateZonePoint(elem.zones.cardio, elem.date, item.patientId))
            points.push(this.buildHeartRateZonePoint(elem.zones.peak, elem.date, item.patientId))
        })
        return points
    }

    /**
     * Builds an IPoint object representing the heart rate measurement.
     *
     * @param zone
     * @param date
     * @param patientId
     */
    private buildHeartRateZonePoint(zone: HeartRateZoneData, date: string, patientId: string): IPoint {
        return {
            measurement: Default.MEASUREMENT_HR_ZONES_NAME,
            fields: {
                max: zone.max,
                min: zone.min,
                duration: zone.duration,
                calories: zone.calories
            },
            tags: {
                user_id: patientId,
                type: zone.type!
            },
            timestamp: new Date(date).getTime() * 1e+6
        }
    }

    /**
     * Builds time series of steps, calories, distance or active minutes.
     *
     * @param obj
     */
    private transformTimeSeries(obj: any): TimeSeries {
        const result = new TimeSeries()
        if (!(obj.data_set instanceof Array)) return result

        // Verify that the dataset is empty
        if (!obj.data_set.length) {
            return this.mountTimeSeriesDefaultValues(obj.start_date, obj.end_date)
        }

        result.summary = new Summary(obj.total)
        result.dataSet = obj.data_set.map((item: any) => {
            return new Item(moment(item.time.toISOString()).utc().format('YYYY-MM-DD'), item.value)
        })

        return result
    }

    /**
     * Builds the heart rate time series.
     *
     * @param obj
     */
    private transformHeartRateTimeSeries(obj: any): TimeSeries {
        const timeSeries = new TimeSeries()
        timeSeries.summary = new HeartRateSummary()

        if (!(obj.data_set instanceof Array)) return timeSeries

        const endDate = moment(obj.end_date).add(1, 'day').format('YYYY-MM-DD')
        let index = 0

        for (const m = moment(obj.start_date); m.isBefore(endDate); m.add(1, 'day')) {
            const heartRateData: Array<any> = (obj.data_set[0] instanceof Array) ? obj.data_set[index] : obj.data_set
            const caloriesData: Array<any> = (obj.calories[0] instanceof Array) ? obj.calories[index] : obj.calories
            const currentDate = m.utc().format('YYYY-MM-DD')

            const heartRateZone: HeartRateZone = this.buildHeartRateZone(obj.zones, heartRateData, caloriesData, currentDate)
            timeSeries.dataSet.push(new HeartRateItem(currentDate, heartRateZone))

            timeSeries.summary.outOfRangeTotal += heartRateZone.outOfRange.duration
            timeSeries.summary.fatBurnTotal += heartRateZone.fatBurn.duration
            timeSeries.summary.cardioTotal += heartRateZone.cardio.duration
            timeSeries.summary.peakTotal += heartRateZone.peak.duration

            index++
        }

        return timeSeries
    }

    private buildHeartRateZone(zones: any, hrData: Array<any>, calories: Array<any>, currentDate: string): HeartRateZone {
        const result: HeartRateZone = new HeartRateZone()

        result.outOfRange = this.getZone(zones, HeartRateZoneType.OUT_OF_RANGE, currentDate)
        result.fatBurn = this.getZone(zones, HeartRateZoneType.FAT_BURN, currentDate)
        result.cardio = this.getZone(zones, HeartRateZoneType.CARDIO, currentDate)
        result.peak = this.getZone(zones, HeartRateZoneType.PEAK, currentDate)

        if (hrData) this.buildDurationAndCaloriesHR(hrData, calories, result)

        return result
    }

    private buildDurationAndCaloriesHR(hrData: Array<any>, calories: Array<any>, heartRateZone: HeartRateZone): HeartRateZone {
        hrData.forEach(elem => {
            if (elem.value >= heartRateZone.outOfRange.min && elem.value < heartRateZone.outOfRange.max) {
                heartRateZone.outOfRange.duration += 60000
                heartRateZone.outOfRange.calories += this.getCals(calories, elem.time)
            } else if (elem.value >= heartRateZone.fatBurn.min && elem.value < heartRateZone.fatBurn.max) {
                heartRateZone.fatBurn.duration += 60000
                heartRateZone.fatBurn.calories += this.getCals(calories, elem.time)
            } else if (elem.value >= heartRateZone.cardio.min && elem.value < heartRateZone.cardio.max) {
                heartRateZone.cardio.duration += 60000
                heartRateZone.cardio.calories += this.getCals(calories, elem.time)
            } else if (elem.value >= heartRateZone.peak.min && elem.value < heartRateZone.peak.max) {
                heartRateZone.peak.duration += 60000
                heartRateZone.peak.calories += this.getCals(calories, elem.time)
            }
        })
        return heartRateZone
    }

    private getZone(zones: any, type: string, date: string): HeartRateZoneData {
        let result = zones.data
            .find((item: any) => item.time.toISOString().split('T')[0] === date && item.type === type)
        if (!result) {
            result = zones.data_default.find((item: any) => {
                // When the zone is the default, what matters is only the min and max
                if (item.type === type) {
                    item.duration = 0
                    item.calories = 0
                    return item
                }
            })
        }
        return new HeartRateZoneData().fromJSON(result)
    }

    private getCals(calories, hrTime): number {
        const result = calories.find(el => {
            return (el.time.getTime() === hrTime.getTime())
        })
        return result ? result.value : 0
    }

    /**
     * Returns Populated TimeSeries object according to start and end date with default values.
     *
     * @param startDate
     * @param endDate
     */
    private mountTimeSeriesDefaultValues(startDate: string, endDate: string): TimeSeries {
        const result = new TimeSeries()
        result.summary = new Summary()
        endDate = moment(endDate).add(1, 'day').format('YYYY-MM-DD')
        for (const m = moment(startDate); m.isBefore(endDate); m.add(1, 'day')) {
            result.dataSet.push(new Item(m.format('YYYY-MM-DD'), 0))
        }
        return result
    }
}
