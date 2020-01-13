import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class IntervalValidator {
    public static validate(interval: string): void | ValidationException {
        // checks if the intervals are between 1sec, 15sec, 1min or 15min
        if (!(/^(0[1]|1[5]?)(s|m)$/i).test(interval)) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.INTERVAL_NOT_SUPPORTED.replace('{0}', interval),
                Strings.ERROR_MESSAGE.INTERVAL_SUPPORTED
            )
        }
    }
}
