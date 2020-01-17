import { ValidationException } from '../exception/validation.exception'
import { ObjectIdValidator } from './object.id.validator'
import { DateValidator } from './date.validator'
import { Strings } from '../../../utils/strings'
import { TimeValidator } from './time.validator'
import { ResourceTypeValidator } from './resource.type.validator'
import { IntervalValidator } from './interval.validator'

export class IntradayListTimeValidator {
    public static validate(patientId: string, type: string, startDate: string, endDate: string,
                           startTime: string, endTime: string, interval: string): void | ValidationException {
        ObjectIdValidator.validate(patientId)
        ResourceTypeValidator.validate(type)
        DateValidator.validate(startDate)
        DateValidator.validate(endDate)
        TimeValidator.validate(startTime)
        TimeValidator.validate(endTime)

        // checks if the difference between dates and times exceeds 24h.
        const diffHours: number = IntradayListTimeValidator
            .dateTimeDiffInHours(new Date(startDate.concat(`T${startTime}`)), new Date(endDate.concat(`T${endTime}`)))
        if (Math.abs(diffHours) > 24) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.TIME.RANGE_INVALID,
                Strings.ERROR_MESSAGE.TIME.RANGE_INVALID_DESC
            )
        }

        // checks if the intervals are between 1sec, 15sec, 1min or 15min
        IntervalValidator.validate(interval)
    }

    public static dateTimeDiffInHours(a: Date, b: Date): number {
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds())
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds())
        return ((utc2 - utc1) / 3.6e+6)
    }
}
