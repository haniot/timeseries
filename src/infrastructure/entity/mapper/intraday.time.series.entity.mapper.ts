import moment from 'moment'
import { IPoint } from 'influx'
import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { TimeSeriesType } from '../../../application/domain/utils/time.series.type'
import { IntradayTimeSeries } from '../../../application/domain/model/intraday.time.series'
import { IntradayTimeSeriesEntity } from '../intraday.time.series.entity'
import { Default } from '../../../utils/default'
import { IntradayItem } from '../../../application/domain/model/intraday.item'
import { HeartRateZoneData } from '../../../application/domain/model/heart.rate.zone.data'
import { IntradayHeartRateSummary } from '../../../application/domain/model/intraday.heart.rate.summary'
import { IntradaySummary } from '../../../application/domain/model/intraday.summary'
import { HeartRateZoneType } from '../../../application/domain/utils/heart.rate.zone.type'
import { HeartRateZone } from '../../../application/domain/model/heart.rate.zone'

@injectable()
export class IntradayTimeSeriesEntityMapper implements IEntityMapper<IntradayTimeSeries, IntradayTimeSeriesEntity> {
    public transform(item: any): any {
        if (item instanceof IntradayTimeSeries) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    /**
     * Transforms application layer object into database format object.
     *
     * @param item
     */
    public modelToModelEntity(item: IntradayTimeSeries): IntradayTimeSeriesEntity {
        if (item.type !== TimeSeriesType.HEART_RATE) {
            return new IntradayTimeSeriesEntity(this.buildPoints(item))
        }
        return new IntradayTimeSeriesEntity(this.buildPoints(item), this.buildHRZonesPoints(item))
    }

    /**
     * Transforms database query result into application layer object.
     *
     * @param json
     */
    public jsonToModel(json: any): IntradayTimeSeries {
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
    private buildPoints(item: IntradayTimeSeries): Array<IPoint> {
        const date = item.summary.startTime.split('T')[0]
        return item.dataSet.map((entry: IntradayItem) => {
            return {
                measurement: Default.MEASUREMENT_TIMESERIES_NAME,
                fields: { value: entry.value },
                tags: {
                    user_id: item.patientId,
                    type: item.type
                },
                timestamp: new Date(`${date}T${entry.time}Z`).getTime() * 1e+6
            }
        }, [])
    }

    /**
     * Builds IPoint Type Array Representing Heart Rate measurements.
     * @param item
     */
    private buildHRZonesPoints(item: IntradayTimeSeries): Array<IPoint> {
        const points: Array<IPoint> = []
        const summary: IntradayHeartRateSummary = item.summary as IntradayHeartRateSummary
        const date = summary.startTime.split('T')[0]

        points.push(this.buildHeartRateZonePoint(summary.zones.outOfRange, date, item.patientId))
        points.push(this.buildHeartRateZonePoint(summary.zones.fatBurn, date, item.patientId))
        points.push(this.buildHeartRateZonePoint(summary.zones.cardio, date, item.patientId))
        points.push(this.buildHeartRateZonePoint(summary.zones.peak, date, item.patientId))
        return points
    }

    /**
     * Builds an IPoint object representing the heart rate measurement.
     * NOTE: calories and duration are not saved to the intraday
     * because the intraday has the information needed to return this information.
     *
     * @param zone Object representing a Heart Rate Zone
     * @param date YYYY-MM-DD
     * @param patientId ID of the patient
     */
    private buildHeartRateZonePoint(zone: HeartRateZoneData, date: string, patientId: string): IPoint {
        return {
            measurement: Default.MEASUREMENT_HR_ZONES_NAME,
            fields: {
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
    private transformTimeSeries(obj: any): IntradayTimeSeries {
        const result = new IntradayTimeSeries()
        if (!(obj.data_set instanceof Array)) return result

        // Verify that the dataset is empty
        if (!obj.data_set.length) {
            return this.mountTimeSeriesDefaultValues(obj.type, obj.start_time, obj.end_time, obj.interval)
        }

        const timestamps = this.buildTimeStamps(obj.start_time, obj.end_time, obj.data_set)
        result.summary = new IntradaySummary(
            timestamps.start_time,
            timestamps.end_time,
            obj.total,
            obj.interval
        )

        result.dataSet = obj.data_set.map(item => {
            return new IntradayItem(moment(item.time.toISOString()).utc().format('HH:mm:ss'), item.value)
        })
        return result
    }

    /**
     * Builds the heart rate time series.
     *
     * @param obj
     */
    private transformHeartRateTimeSeries(obj: any): IntradayTimeSeries {
        const result = new IntradayTimeSeries()
        if (!(obj.data_set instanceof Array)) return result

        const timestamps = this.buildTimeStamps(obj.start_time, obj.end_time, obj.data_set)
        result.summary = new IntradayHeartRateSummary(
            timestamps.start_time,
            timestamps.end_time,
            obj.min,
            obj.max,
            obj.average,
            obj.interval
        )
        result.summary.zones = this.buildHeartRateZone(obj.zones, obj.data_set_base, obj.calories)

        result.dataSet = obj.data_set.map(item => {
            return new IntradayItem(moment(item.time.toISOString()).utc().format('HH:mm:ss'), item.value)
        })
        return result
    }

    /**
     * Build object with Heart Rate zones.
     *
     * @param zones
     * @param hr
     * @param calories
     */
    private buildHeartRateZone(zones: Array<any>, hr: Array<any>, calories: Array<any>): HeartRateZone {
        const result: HeartRateZone = new HeartRateZone()

        const outOfRange = zones.find(elem => elem.type === HeartRateZoneType.OUT_OF_RANGE)
        if (outOfRange) {
            result.outOfRange = new HeartRateZoneData(outOfRange.min, outOfRange.max, 0, 0)
        }

        const fatBurn = zones.find(elem => elem.type === HeartRateZoneType.FAT_BURN)
        if (fatBurn) {
            result.fatBurn = new HeartRateZoneData(fatBurn.min, fatBurn.max, 0, 0)
        }

        const cardio = zones.find(elem => elem.type === HeartRateZoneType.CARDIO)
        if (cardio) {
            result.cardio = new HeartRateZoneData(cardio.min, cardio.max, 0, 0)
        }

        const peak = zones.find(elem => elem.type === HeartRateZoneType.PEAK)
        if (peak) {
            result.peak = new HeartRateZoneData(peak.min, peak.max, 0, 0)
        }
        this.buildDurationAndCaloriesHR(hr, calories, result)
        return result
    }

    /**
     * Build objects with zones containing durations and calories according to the heart rate array.
     *
     * @param hrData
     * @param calories
     * @param heartRateZone
     */
    private buildDurationAndCaloriesHR(hr: Array<any>, calories: Array<any>, heartRateZone: HeartRateZone): HeartRateZone {
        hr.forEach(elem => {
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

    /**
     * Recovers calorie value according to time.
     *
     * @param calories Array<any> Object array containing calories
     * @param hrTime HH:mm:ss
     */
    private getCals(calories, hrTime): number {
        const result = calories.find(el => {
            return (el.time.getTime() === hrTime.getTime())
        })
        return result ? result.value : 0
    }

    /**
     * Returns Populated TimeSeries object according to start and end date with default values.
     *
     * @param type
     * @param startTime
     * @param endTime
     * @param interval
     */
    private mountTimeSeriesDefaultValues(type: string, startTime: string, endTime: string, interval: string): IntradayTimeSeries {
        const result = new IntradayTimeSeries()

        result.summary = new IntradaySummary(
            moment(startTime).utc().format('YYYY-MM-DDTHH:mm:ss'),
            moment(endTime).utc().format('YYYY-MM-DDTHH:mm:ss'),
            0,
            interval
        )
        const intervalValue = parseInt(interval.slice(0, -1), 10)
        const intervalUnit = interval.slice(-1) === 's' ? 'seconds' : 'minutes'
        if (interval.includes('m')) { // minutes
            endTime = moment(endTime).utc().set({ seconds: 0 })
                .add(1, 'minute')
                .format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
            startTime = moment(startTime).utc().set({ seconds: 0 }).format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
        }
        // if (moment(moment(startTime).utc().format(`YYYY-MM-DD`)).isSame(moment()
        //     .format(`YYYY-MM-DD`), 'day')) {
        //     endTime = moment().format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
        // }
        for (const m = moment(startTime).utc(); m.utc().isBefore(endTime); m.utc().add(intervalValue, intervalUnit)) {
            result.dataSet.push(new IntradayItem(m.utc().format('HH:mm:ss'), 0))
        }
        return result
    }

    /**
     * Use parameters to build start_time and end_time.
     *
     * @param startTime
     * @param endTime
     * @param dataSet
     */
    private buildTimeStamps(startTime: any, endTime: any, dataSet: Array<any>): any {
        const result = (_start, _end) => {
            return {
                start_time: _start.utc().format('YYYY-MM-DDTHH:mm:ss'),
                end_time: _end.utc().format('YYYY-MM-DDTHH:mm:ss')
            }
        }
        if (!dataSet.length) return result(moment(startTime), moment(endTime))

        const _startTime = dataSet[0].time ? moment(dataSet[0].time.toISOString()) : moment(startTime)
        const _endTime = dataSet[dataSet.length - 1].time ?
            moment(dataSet[dataSet.length - 1].time.toISOString()) :
            moment(endTime)

        return result(_startTime, _endTime)
    }
}
