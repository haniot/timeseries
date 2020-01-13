import moment from 'moment'
import { HeartRateZoneType } from '../../src/application/domain/utils/heart.rate.zone.type'
import { TimeSeriesType } from '../../src/application/domain/utils/time.series.type'

export class IntradayTimeSeriesDBMock {
    public generate(startTime: string, endTime: string, interval: string, type?: string): any {
        if (!type) {
            type = Object.values(TimeSeriesType)[Math.floor((Math.random() * 5))] // 0-4
        }

        return this.generateTimeSeries(startTime, endTime, interval, type)
    }

    private generateTimeSeries(startTime: string, endTime: string, interval: string, type: string): any {
        const timeSeries: any = this.generateDataset(startTime, endTime, interval, type)
        timeSeries.type = type
        timeSeries.interval = interval
        timeSeries.start_time = startTime
        timeSeries.end_time = endTime

        if (type === TimeSeriesType.HEART_RATE) {
            timeSeries.zones = []
            timeSeries.zones.push(this.getZone(HeartRateZoneType.OUT_OF_RANGE, startTime))
            timeSeries.zones.push(this.getZone(HeartRateZoneType.FAT_BURN, startTime))
            timeSeries.zones.push(this.getZone(HeartRateZoneType.CARDIO, startTime))
            timeSeries.zones.push(this.getZone(HeartRateZoneType.PEAK, startTime))

            if (interval !== '1m') timeSeries.data_set_base = this.generate(startTime, endTime, '1m',
                TimeSeriesType.HEART_RATE).data_set
            else timeSeries.data_set_base = timeSeries.data_set
            timeSeries.calories = this.generate(startTime, endTime, '1m', TimeSeriesType.CALORIES).data_set
        }
        // timeSeries.data_set.groupRows = new Array(timeSeries.data_set.length)

        return timeSeries
    }

    private generateDataset(startTime: string, endTime: string, interval: string, type: string): any {
        const dataset: Array<any> = []
        const intervalValue = parseInt(interval.slice(0, -1), 10)
        const intervalUnit = interval.slice(-1) === 's' ? 'seconds' : 'minutes'
        let total: number = 0
        let min: number = Number.MAX_SAFE_INTEGER
        let max: number = Number.MIN_SAFE_INTEGER

        // endTime = moment(endTime).utc().add(1, 'minute').format(`YYYY-MM-DDTHH:mm:ss.SSS[Z]`)
        for (const current = moment(startTime).utc(); current.utc().isBefore(endTime);
             current.utc().add(intervalValue, intervalUnit)) {
            let random = 0
            if (type === TimeSeriesType.STEPS) {
                random = Math.floor((Math.random() * 101)) // 0-100
            } else if (type === TimeSeriesType.CALORIES) {
                random = (Math.random() * 13) // 0-12
            } else if (type === TimeSeriesType.DISTANCE) {
                random = (Math.random() * 36) // 0-35 in metres
            } else if (type === TimeSeriesType.ACTIVE_MINUTES) {
                random = Math.floor(Math.random() * 2) * 60000 // 0-1 minute in milliseconds
            } else {
                random = Math.floor((Math.random() * 201)) + 30 // 30-200 heart rate
                if (random > max) max = random
                if (random < min) min = random
            }
            const datetime = current.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
            const time: any = {
                toNanoISOString: () => datetime,
                toISOString: () => datetime,
                getTime: () => new Date(datetime).getTime()
            }
            total += random
            dataset.push({ time, value: random })
        }
        return { data_set: dataset, total, min, max, average: Math.floor(total / dataset.length) }
    }

    private getZone(type, datetime): any {
        const minutes = Math.floor((Math.random() * 101)) * 60000 // 0-100
        const calories = !minutes ? 0 : Math.floor((Math.random() * 5101 + 100)) // 100-5100
        const time: any = {
            toNanoISOString: () => datetime,
            toISOString: () => datetime,
            getTime: () => new Date(datetime).getTime()
        }
        return {
            out_of_range: () => ({ time, min: 30, max: 91, value: minutes, calories, type: HeartRateZoneType.OUT_OF_RANGE }),
            fat_burn: () => ({ time, min: 91, max: 127, value: minutes, calories, type: HeartRateZoneType.FAT_BURN }),
            cardio: () => ({ time, min: 127, max: 154, value: minutes, calories, type: HeartRateZoneType.CARDIO }),
            peak: () => ({ time, min: 154, max: 220, value: minutes, calories, type: HeartRateZoneType.PEAK })
        }[type]()
    }
}
