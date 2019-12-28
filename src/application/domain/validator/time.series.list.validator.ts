import { ValidationException } from '../exception/validation.exception'
import { ObjectIdValidator } from './object.id.validator'
import { DateValidator } from './date.validator'
import { DateRangeValidator } from './date.range.validator'
import { TimeSeriesType } from '../utils/time.series.type'
import { Strings } from '../../../utils/strings'

export class TimeSeriesListValidator {
    public static validate(patientId: string, startDate: string, endDate: string, type?: string): void | ValidationException {
        const timeSeriesTypes = Object.keys(TimeSeriesType).map(key => TimeSeriesType[key])

        ObjectIdValidator.validate(patientId)
        if (type && !timeSeriesTypes.includes(type)) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.TIMESERIES_NOT_SUPPORTED.replace('{0}', type),
                Strings.ERROR_MESSAGE.TIMESERIES_SUPPORTED.replace('{0}', timeSeriesTypes.join(', '))
            )
        }
        DateValidator.validate(startDate)
        DateValidator.validate(endDate)
        DateRangeValidator.validate(startDate, endDate)
    }
}
