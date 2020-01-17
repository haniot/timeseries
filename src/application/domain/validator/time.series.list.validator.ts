import { ValidationException } from '../exception/validation.exception'
import { ObjectIdValidator } from './object.id.validator'
import { DateValidator } from './date.validator'
import { DateRangeValidator } from './date.range.validator'
import { ResourceTypeValidator } from './resource.type.validator'

export class TimeSeriesListValidator {
    public static validate(patientId: string, startDate: string, endDate: string, type?: string): void | ValidationException {
        ObjectIdValidator.validate(patientId)
        if (type) ResourceTypeValidator.validate(type)
        DateValidator.validate(startDate)
        DateValidator.validate(endDate)
        DateRangeValidator.validate(startDate, endDate)
    }
}
