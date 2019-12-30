import moment from 'moment'
import { TimeSeries } from '../../src/application/domain/model/time.series'
import { HeartRateZoneType } from '../../src/application/domain/utils/heart.rate.zone.type'
import { TimeSeriesType } from '../../src/application/domain/utils/time.series.type'

export class TimeSeriesDBMock {
    public generate(startDate: string, endDate: string, type?: string): TimeSeries {
        if (!type) {
            type = Object.values(TimeSeriesType)[Math.floor((Math.random() * 5))] // 0-4
        }

        if (type !== TimeSeriesType.HEART_RATE) {
            return this.generateTimeSeries(startDate, endDate, type)
        }
        return this.generateHeartRateTimeSeries(startDate, endDate)
    }

    private generateTimeSeries(startDate: string, endDate: string, type: string): any {
        const timeSeries: any = {
            type, start_date: startDate, end_date: endDate, data_set: [[], []]
        }

        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        let total = 0
        for (const current = moment(startDate); current.isBefore(endDate); current.add(1, 'days')) {
            let random = Math.floor((Math.random() * 20001 + 100)) // 100-20100
            if (type === TimeSeriesType.ACTIVE_MINUTES) {
                random = Math.floor((Math.random() * 101)) * 60000 // 0-100 in milliseconds
            }
            const datetime = current.format('YYYY-MM-DD').concat('T00:00:00.000Z')
            const time: any = {
                toNanoISOString: () => datetime
            }
            total += random
            timeSeries.data_set[0].push({ time, value: random })
        }
        timeSeries.data_set[0].groupRows = new Array(timeSeries.data_set.length)
        timeSeries.data_set[1].push({ time: endDate, total })
        timeSeries.data_set[1].groupRows = new Array(1)

        return timeSeries
    }

    private generateHeartRateTimeSeries(startDate: string, endDate: string): TimeSeries {
        const timeSeries: any = {
            type: TimeSeriesType.HEART_RATE, start_date: startDate, end_date: endDate, data_set: []
        }
        const totalDays = moment(startDate).diff(moment(endDate), 'days')

        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        for (const current = moment(startDate); current.isBefore(endDate); current.add(1, 'days')) {
            const datetime = current.format('YYYY-MM-DD').concat('T00:00:00.000Z')
            const _array: any = []

            _array.push(this.getZone(HeartRateZoneType.OUT_OF_RANGE, datetime))
            _array.push(this.getZone(HeartRateZoneType.FAT_BURN, datetime))
            _array.push(this.getZone(HeartRateZoneType.CARDIO, datetime))
            _array.push(this.getZone(HeartRateZoneType.PEAK, datetime))

            if (!totalDays) {
                for (const item of _array) timeSeries.data_set.push(item)
                timeSeries.data_set.groupRows = new Array(1)
            } else {
                _array.groupRows = new Array(_array.lenght)
                timeSeries.data_set.push(_array)
            }
        }
        return timeSeries
    }

    private getZone(type, datetime): any {
        const minutes = Math.floor((Math.random() * 101)) * 60000 // 0-100
        const calories = !minutes ? 0 : Math.floor((Math.random() * 5101 + 100)) // 100-5100
        const time: any = {
            toNanoISOString: () => datetime
        }
        return {
            out_of_range: () => ({ time, min: 30, max: 91, value: minutes, calories, type: HeartRateZoneType.OUT_OF_RANGE }),
            fat_burn: () => ({ time, min: 91, max: 127, value: minutes, calories, type: HeartRateZoneType.FAT_BURN }),
            cardio: () => ({ time, min: 127, max: 154, value: minutes, calories, type: HeartRateZoneType.CARDIO }),
            peak: () => ({ time, min: 154, max: 220, value: minutes, calories, type: HeartRateZoneType.PEAK })
        }[type]()
    }
}
