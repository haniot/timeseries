import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class DateValidator {
    public static validate(date: string): void | ValidationException {
        // validate ISO 8601
        if (!(/^\d{4}-(0[1-9]|1[0-2])-\d\d$/i).test(date)) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', date),
                Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT_DESC
            )
        }

        // Validate day
        // Parse the date parts to integers
        const parts = date.split('-')
        const year = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10)
        const day = parseInt(parts[2], 10)
        const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

        // Check the ranges year
        // InfluxDB The minimum timestamp is -9223372036854775806 or 1677-09-21T00:12:43.145224194Z.
        // The maximum timestamp is 9223372036854775806 or 2262-04-11T23:47:16.854775806Z.
        if (year < 1678 || year > 2261) {
            throw new ValidationException(Strings.ERROR_MESSAGE.DATE.YEAR_NOT_ALLOWED
                .replace('{0}', date))
        }

        // Adjust for leap years
        if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29

        // Check the range of the day
        if (!(day > 0 && day <= monthLength[month - 1])) {
            throw new ValidationException(Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT
                .replace('{0}', date))
        }
    }
}
