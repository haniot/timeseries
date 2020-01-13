import { ValidationException } from '../exception/validation.exception'
import { ObjectIdValidator } from './object.id.validator'
import { DateValidator } from './date.validator'
import { ResourceTypeValidator } from './resource.type.validator'
import { TimeSeries } from '../model/time.series'
import { TimeSeriesType } from '../utils/time.series.type'
import { Strings } from '../../../utils/strings'
import { HeartRateItemCreateValidator } from './heart.rate.item.create.validator'

export class TimeSeriesCreateValidator {
    public static validate(timeSeries: TimeSeries): void | ValidationException {
        ObjectIdValidator.validate(timeSeries.patientId)
        ResourceTypeValidator.validate(timeSeries.type)

        if (timeSeries.type !== TimeSeriesType.HEART_RATE) {
            timeSeries.dataSet.forEach((elem: any) => {
                DateValidator.validate(elem.date)
                if (!Number(elem.value) || elem.value < 0) {
                    throw new ValidationException(
                        Strings.ERROR_MESSAGE.VALIDATE.VALUE.replace('{0}', elem.value),
                        Strings.ERROR_MESSAGE.VALIDATE.VALUE_DESC
                    )
                }
            })
            return
        }

        timeSeries.dataSet.forEach((elem: any) => {
            HeartRateItemCreateValidator.validate(elem)
        })
    }
}
