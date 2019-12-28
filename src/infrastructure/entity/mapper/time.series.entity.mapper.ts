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
        return item.dataSet.map((entry) => {
            entry = entry as Item
            return {
                measurement: Default.MEASUREMENT_NAME,
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
        item.dataSet.forEach((value) => {
            value = value as HeartRateItem
            points.push(this.buildHeartRateZonePoint(value.zones.outOfRange, value.date, item.patientId))
            points.push(this.buildHeartRateZonePoint(value.zones.fatBurn, value.date, item.patientId))
            points.push(this.buildHeartRateZonePoint(value.zones.cardio, value.date, item.patientId))
            points.push(this.buildHeartRateZonePoint(value.zones.peak, value.date, item.patientId))
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
            measurement: Default.MEASUREMENT_HR_NAME,
            fields: {
                value: zone.duration,
                calories: zone.calories,
                max: zone.max,
                min: zone.min
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
        if (!obj.data_set[0].groupRows.length) {
            return this.mountTimeSeriesDefaultValues(obj.start_date, obj.end_date)
        }

        result.summary = new Summary(obj.data_set[1][0].total)
        result.dataSet = obj.data_set[0].map(item => {
            return new Item(item.time.toNanoISOString().split('T')[0], item.value)
        })

        return result
    }

    /**
     * Builds the heart rate time series.
     *
     * @param obj
     */
    private transformHeartRateTimeSeries(obj: any): TimeSeries {
        const startDate = moment(obj.start_date)
        const timeSeries = new TimeSeries()
        const summary: HeartRateSummary = new HeartRateSummary()
        timeSeries.summary = summary

        if (!(obj.data_set instanceof Array)) return timeSeries

        // Verify data_set = { groupRows: [ [Object] ] }
        if (obj.data_set.groupRows) {
            const heartRateItem = new HeartRateItem()
            heartRateItem.zones = new HeartRateZone()
            heartRateItem.date = startDate.format('YYYY-MM-DD')
            timeSeries.dataSet = [heartRateItem]

            if (obj.data_set.groupRows.length) {
                heartRateItem.zones = this.buildHeartRateZone(obj.data_set, summary)
            }
            return timeSeries
        }

        timeSeries.dataSet = obj.data_set.map(_array => {
            const heartRateItem = new HeartRateItem()
            heartRateItem.date = startDate.format('YYYY-MM-DD')
            startDate.add(1, 'days')

            heartRateItem.zones = this.buildHeartRateZone(_array, summary)
            return heartRateItem
        })
        return timeSeries
    }

    /**
     * Builds heart rate zones and increments the total of each zone to the summary.
     *
     * @param _array
     * @param summary
     */
    private buildHeartRateZone(_array: Array<any>, summary: HeartRateSummary): HeartRateZone {
        const heartRateZone = new HeartRateZone()
        _array.forEach(item => {
            if (item.type === HeartRateZoneType.OUT_OF_RANGE) {
                summary.outOfRangeTotal += item.value
                heartRateZone.outOfRange = new HeartRateZoneData(item.min, item.max, item.value, item.calories)
            } else if (item.type === HeartRateZoneType.FAT_BURN) {
                summary.fatBurnTotal += item.value
                heartRateZone.fatBurn = new HeartRateZoneData(item.min, item.max, item.value, item.calories)
            } else if (item.type === HeartRateZoneType.CARDIO) {
                summary.cardioTotal += item.value
                heartRateZone.cardio = new HeartRateZoneData(item.min, item.max, item.value, item.calories)
            } else if (item.type === HeartRateZoneType.PEAK) {
                summary.peakTotal += item.value
                heartRateZone.peak = new HeartRateZoneData(item.min, item.max, item.value, item.calories)
            }
        })
        return heartRateZone
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
        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        for (const m = moment(startDate); m.isBefore(endDate); m.add(1, 'days')) {
            result.dataSet.push(new Item(m.format('YYYY-MM-DD'), 0))
        }
        return result
    }
}
