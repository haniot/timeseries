import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { DateValidator } from './date.validator'

export class DatetimeValidator {
    public static validate(datetime: string): void | ValidationException {
        // validate ISO 8601
        if (!(/^\d{4}-(0[1-9]|1[0-2])-\d\dT([0-1][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i)
            .test(datetime)) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.DATE.INVALID_DATETIME_FORMAT.replace('{0}', datetime),
                Strings.ERROR_MESSAGE.DATE.INVALID_DATETIME_FORMAT_DESC
            )
        }

        // Take only the date part and call the specific validator.
        // This is useful for validating the year and day of the month.
        try {
            const date = datetime.split('T')[0]
            DateValidator.validate(date)
        } catch (e) {
            throw new ValidationException(Strings.ERROR_MESSAGE.DATE.INVALID_DATETIME_FORMAT
                .replace('{0}', datetime))
        }
    }
}
