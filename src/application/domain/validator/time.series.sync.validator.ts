import { ValidationException } from '../exception/validation.exception'
import { ObjectIdValidator } from './object.id.validator'
import { DateValidator } from './date.validator'
import { ResourceTypeValidator } from './resource.type.validator'
import { TimeSeries } from '../model/time.series'
import { TimeSeriesType } from '../utils/time.series.type'
import { HeartRateZonesSyncValidator } from './heart.rate.zones.sync.validator'
import { NumberPositiveValidator } from './number.positive.validator'
import { IntegerPositiveValidator } from './integer.positive.validator'

export class TimeSeriesSyncValidator {
    public static validate(timeSeries: TimeSeries): void | ValidationException {
        ObjectIdValidator.validate(timeSeries.patientId)
        ResourceTypeValidator.validate(timeSeries.type)

        timeSeries.dataSet.forEach((elem: any) => {
            DateValidator.validate(elem.date)

            if (timeSeries.type === TimeSeriesType.HEART_RATE) {
                HeartRateZonesSyncValidator.validate(elem.zones)
            } else if (timeSeries.type === TimeSeriesType.CALORIES || timeSeries.type === TimeSeriesType.DISTANCE) {
                // Can be integer or decimal
                NumberPositiveValidator.validate(elem.value)
            } else {
                IntegerPositiveValidator.validate(elem.value)
            }
        })
        return
    }
}
