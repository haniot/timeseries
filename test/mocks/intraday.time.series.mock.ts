import moment from 'moment'
import { TimeSeriesType } from '../../src/application/domain/utils/time.series.type'
import { IntradayTimeSeries } from '../../src/application/domain/model/intraday.time.series'
import { IntradaySummary } from '../../src/application/domain/model/intraday.summary'
import { IntradayItem } from '../../src/application/domain/model/intraday.item'
import { IntradayHeartRateSummary } from '../../src/application/domain/model/intraday.heart.rate.summary'
import { HeartRateZone } from '../../src/application/domain/model/heart.rate.zone'
import { HeartRateZoneData } from '../../src/application/domain/model/heart.rate.zone.data'
import { HeartRateZoneType } from '../../src/application/domain/utils/heart.rate.zone.type'

export class IntradayTimeSeriesMock {
    public generate(startTime: string, endTime: string, interval: string, type?: string): IntradayTimeSeries {
        if (!type) {
            type = Object.values(TimeSeriesType)[Math.floor((Math.random() * 5))] // 0-5
        }

        if (type !== TimeSeriesType.HEART_RATE) {
            return this.generateIntradayTimeSeries(startTime, endTime, interval, type)
        }
        return this.generateHeartRateIntradayTimeSeries(startTime, endTime, interval)
    }

    private generateIntradayTimeSeries(startTime: string, endTime: string, interval: string, type: string): IntradayTimeSeries {
        const timeSeries = new IntradayTimeSeries()
        timeSeries.type = type
        timeSeries.patientId = this.generateObjectId()
        timeSeries.summary = new IntradaySummary()
        timeSeries.summary.interval = interval
        timeSeries.summary.startTime = startTime
        timeSeries.summary.endTime = endTime

        const intervalValue = parseInt(interval.slice(0, -1), 10)
        const intervalUnit = interval.slice(-1) === 's' ? 'seconds' : 'minutes'
        for (const current = moment(startTime); current.isBefore(endTime); current.add(intervalValue, intervalUnit)) {
            let random = 0
            if (timeSeries.type === TimeSeriesType.STEPS) {
                random = Math.floor((Math.random() * 101)) // 0-100
            } else if (timeSeries.type === TimeSeriesType.CALORIES) {
                random = (Math.random() * 13) // 0-12
            } else if (timeSeries.type === TimeSeriesType.DISTANCE) {
                random = (Math.random() * 36) // 0-35 in metres
            } else if (timeSeries.type === TimeSeriesType.ACTIVE_MINUTES) {
                random = Math.floor(Math.random() * 2) * 60000 // 0-1 minute in milliseconds
            }
            timeSeries.summary.total += random
            timeSeries.dataSet.push(new IntradayItem(current.format('HH:mm:ss'), random))
        }
        return timeSeries
    }

    private generateHeartRateIntradayTimeSeries(startDate: string, endDate: string, interval: string): IntradayTimeSeries {
        const timeSeries = new IntradayTimeSeries()
        timeSeries.type = TimeSeriesType.HEART_RATE
        timeSeries.patientId = this.generateObjectId()
        timeSeries.summary = new IntradayHeartRateSummary()
        timeSeries.summary.startTime = startDate
        timeSeries.summary.endTime = endDate
        timeSeries.summary.min = Number.MAX_SAFE_INTEGER
        timeSeries.summary.max = Number.MIN_SAFE_INTEGER
        timeSeries.summary.interval = interval
        let sum = 0

        const intervalValue = parseInt(interval.slice(0, -1), 10)
        const intervalUnit = interval.slice(-1) === 's' ? 'seconds' : 'minutes'
        // endDate = moment(endDate).add(1, 'minute').format()
        for (const current = moment(startDate); current.isBefore(endDate); current.add(intervalValue, intervalUnit)) {
            const random = Math.floor((Math.random() * 201)) + 30 // 30-200

            sum += random
            if (random !== 0) {
                if (random < timeSeries.summary.min) timeSeries.summary.min = random
                if (random > timeSeries.summary.max) timeSeries.summary.max = random
            }
            timeSeries.dataSet.push(new IntradayItem(current.format('HH:mm:ss'), random))
        }
        timeSeries.summary.zones = this.getHeartRateZone(timeSeries.dataSet)
        timeSeries.summary.average = Math.round(sum / timeSeries.dataSet.length)
        return timeSeries
    }

    private getHeartRateZone(_array: Array<IntradayItem>): HeartRateZone {
        const heartRateZone = new HeartRateZone(
            new HeartRateZoneData(30, 91, 0, 0, HeartRateZoneType.OUT_OF_RANGE),
            new HeartRateZoneData(91, 127, 0, 0, HeartRateZoneType.FAT_BURN),
            new HeartRateZoneData(127, 154, 0, 0, HeartRateZoneType.CARDIO),
            new HeartRateZoneData(154, 220, 0, 0, HeartRateZoneType.PEAK)
        )
        for (const item of _array) {
            const calories: number = (Math.random() * 5100 + 100) // 100-5100
            if (item.value >= 30 && item.value < 91) {
                heartRateZone.outOfRange.duration += 1000 // 1sec in milliseconds
                heartRateZone.outOfRange.calories = calories
            } else if (item.value >= 91 && item.value < 127) {
                heartRateZone.fatBurn.duration += 1000
                heartRateZone.fatBurn.calories = calories
            } else if (item.value >= 127 && item.value < 154) {
                heartRateZone.cardio.duration += 1000
                heartRateZone.cardio.calories = calories
            } else if (item.value >= 154 && item.value < 220) {
                heartRateZone.peak.duration += 1000
                heartRateZone.peak.calories = calories
            }
        }
        return heartRateZone
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }
}
