import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class IntervalValidator {
    public static validate(interval: string): void | ValidationException {
        // Checks whether the interval has at least one digit >= 0 and whether it is in seconds or minutes.
        if (!(/^([1-9][0-9]*)([sm])$/).test(interval)) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.INTERVAL_NOT_SUPPORTED.replace('{0}', interval),
                Strings.ERROR_MESSAGE.INTERVAL_SUPPORTED
            )
        }

        // Converting the interval number to hours.
        let intervalNumber
        if (interval.indexOf('s') !== -1) intervalNumber = Number(interval.substring(0, interval.indexOf('s'))) / 3600 // Seconds.
        else intervalNumber = Number(interval.substring(0, interval.indexOf('m'))) / 60 // Minutes.
        if (intervalNumber > 12) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.INTERVAL_NOT_SUPPORTED.replace('{0}', interval),
                Strings.ERROR_MESSAGE.INTERVAL_LENGTH
            )
        }
    }
}
