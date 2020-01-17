import moment from 'moment'
import { TimeSeriesType } from '../../src/application/domain/utils/time.series.type'
import { IntradayTimeSeriesDBMock } from './intraday.time.series.db.mock'

export class TimeSeriesDBMock {
    public generate(startDate: string, endDate: string, type?: string): any {
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
            type, start_date: startDate, end_date: endDate, data_set: [], total: 0
        }

        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        let total = 0
        for (const current = moment(startDate); current.isBefore(endDate); current.add(1, 'days')) {
            let random = Math.floor((Math.random() * 20001 + 100)) // 100-20100
            if (type === TimeSeriesType.ACTIVE_MINUTES) {
                random = Math.floor((Math.random() * 101)) * 60000 // 0-100 in milliseconds
            } else if (type === TimeSeriesType.HEART_RATE) {
                random = Math.floor((Math.random() * 201)) + 30 // 30-200 heart rate
            }
            const datetime = current.format('YYYY-MM-DD').concat('T00:00:00.000Z')
            const time: any = {
                toNanoISOString: () => datetime,
                toISOString: () => datetime,
                getTime: () => new Date(datetime).getTime()
            }
            total += random
            timeSeries.data_set.push({ time, value: random })
        }
        timeSeries.total = total
        timeSeries.data_set.groupRows = new Array(timeSeries.data_set.length)

        return timeSeries
    }

    private generateHeartRateTimeSeries(startDate: string, endDate: string): any {
        const timeSeries: any = {
            type: TimeSeriesType.HEART_RATE, start_date: startDate, end_date: endDate, data_set: [],
            zones: { data: [], data_default: [] }, calories: []
        }
        const totalDays = moment(startDate).diff(moment(endDate), 'days')

        endDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD')
        for (const current = moment(startDate); current.isBefore(endDate); current.add(1, 'days')) {
            const startTime = current.set({ hours: 0, minutes: 0, seconds: 0 }).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
            const endTime = current.set({ hours: 23, minutes: 59, seconds: 59 }).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')

            const dataSet: any = new IntradayTimeSeriesDBMock()
                .generate(startTime, endTime, '1m', TimeSeriesType.HEART_RATE)

            if (!totalDays) {
                timeSeries.data_set = dataSet.data_set
                timeSeries.calories = dataSet.calories
                timeSeries.zones.data = dataSet.zones
            } else {
                timeSeries.data_set.push(dataSet.data_set)
                timeSeries.calories.push(dataSet.calories)
                dataSet.zones.forEach(element => timeSeries.zones.data.push(element))
            }
        }
        timeSeries.zones.data_default = timeSeries.zones.data.slice(0, 4)
        return timeSeries
    }
}
