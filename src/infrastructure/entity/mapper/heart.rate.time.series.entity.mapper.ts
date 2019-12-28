import { injectable } from 'inversify'
import { TimeSeries } from '../../../application/domain/model/time.series'
import { TimeSeriesEntity } from '../time.series.entity'
import { IEntityMapper } from '../../port/entity.mapper.interface'

@injectable()
export class HeartRateTimeSeriesEntityMapper implements IEntityMapper<TimeSeries, TimeSeriesEntity> {
    public transform(item: any): any {
        if (item instanceof TimeSeries) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    public modelToModelEntity(item: TimeSeries): TimeSeriesEntity {
        throw new Error('not supported!')
    }

    public jsonToModel(json: any): TimeSeries {
        const result = new TimeSeries()
        // let fat_burn_total: number = 0
        // let cardio_total: number = 0
        // let peak_total: number = 0
        // let out_of_range_total: number = 0
        //
        // result.summary = new HeartRateSummary()
        // if (json instanceof Array) {
        //     json.forEach(value => {
        //         const heartRateItem = new HeartRateItem()
        //         heartRateItem.date
        //         result.dataSet.push()
        //     })
        // }
        return result
    }
}
