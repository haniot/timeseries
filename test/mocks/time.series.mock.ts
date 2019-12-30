import moment from 'moment'
import { TimeSeries } from '../../src/application/domain/model/time.series'
import { Summary } from '../../src/application/domain/model/summary'
import { Item } from '../../src/application/domain/model/item'
import { HeartRateSummary } from '../../src/application/domain/model/heart.rate.summary'
import { HeartRateItem } from '../../src/application/domain/model/heart.rate.item'
import { HeartRateZone } from '../../src/application/domain/model/heart.rate.zone'
import { HeartRateZoneData } from '../../src/application/domain/model/heart.rate.zone.data'
import { HeartRateZoneType } from '../../src/application/domain/utils/heart.rate.zone.type'
import { TimeSeriesType } from '../../src/application/domain/utils/time.series.type'

export class TimeSeriesMock {
    public generate(startDate: string, endDate: string, type?: string): TimeSeries {
        if (!type) {
            type = Object.values(TimeSeriesType)[Math.floor((Math.random() * 5))] // 0-4
        }

        if (type !== TimeSeriesType.HEART_RATE) {
            return this.generateTimeSeries(startDate, endDate, type)
        }
        return this.generateHeartRateTimeSeries(startDate, endDate)
    }

    private generateTimeSeries(startDate: string, endDate: string, type: string): TimeSeries {
        const timeSeries = new TimeSeries()
        timeSeries.type = type
        timeSeries.patientId = this.generateObjectId()
        timeSeries.summary = new Summary()

        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        for (const current = moment(startDate); current.isBefore(endDate); current.add(1, 'days')) {
            let random = Math.floor((Math.random() * 20001 + 100)) // 100-20100
            if (timeSeries.type === TimeSeriesType.ACTIVE_MINUTES) {
                random = Math.floor((Math.random() * 101)) * 60000 // 0-100 minute in milliseconds
            }
            timeSeries.summary.total += random
            timeSeries.dataSet.push(new Item(current.format('YYYY-MM-DD'), random))
        }
        return timeSeries
    }

    private generateHeartRateTimeSeries(startDate: string, endDate: string): TimeSeries {
        const timeSeries = new TimeSeries()
        timeSeries.type = TimeSeriesType.HEART_RATE
        timeSeries.summary = new HeartRateSummary()
        timeSeries.patientId = this.generateObjectId()

        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        for (const current = moment(startDate); current.isBefore(endDate); current.add(1, 'days')) {
            const zones: HeartRateZone = new HeartRateZone()
            const heartRateItem = new HeartRateItem(current.format('YYYY-MM-DD'), zones)

            zones.outOfRange = this.getZone(HeartRateZoneType.OUT_OF_RANGE)
            timeSeries.summary.outOfRangeTotal += zones.outOfRange.duration

            zones.fatBurn = this.getZone(HeartRateZoneType.FAT_BURN)
            timeSeries.summary.fatBurnTotal += zones.fatBurn.duration

            zones.cardio = this.getZone(HeartRateZoneType.CARDIO)
            timeSeries.summary.cardioTotal += zones.cardio.duration

            zones.peak = this.getZone(HeartRateZoneType.PEAK)
            timeSeries.summary.peakTotal += zones.peak.duration

            timeSeries.dataSet.push(heartRateItem)
        }
        return timeSeries
    }

    private generateObjectId(): string {
        const chars = 'abcdef0123456789'
        let randS = ''
        for (let i = 0; i < 24; i++) {
            randS += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return randS
    }

    private getZone(type): any {
        const minutes = Math.floor((Math.random() * 101)) * 60000 // 0-100
        const calories = !minutes ? 0 : Math.floor((Math.random() * 5101 + 100)) // 100-5100
        return {
            out_of_range: () => (new HeartRateZoneData(30, 91, minutes, calories, HeartRateZoneType.OUT_OF_RANGE)),
            fat_burn: () => (new HeartRateZoneData(91, 127, minutes, calories, HeartRateZoneType.FAT_BURN)),
            cardio: () => (new HeartRateZoneData(127, 154, minutes, calories, HeartRateZoneType.CARDIO)),
            peak: () => (new HeartRateZoneData(154, 220, minutes, calories, HeartRateZoneType.PEAK))
        }[type]()
    }
}
