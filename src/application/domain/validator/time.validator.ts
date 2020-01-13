import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class TimeValidator {
    public static validate(time: string): void | ValidationException {
        if (!(/^(2[0-3]|[01][0-9]):([0-5][0-9])(:([0-5][0-9]))?$/i).test(time)) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT.replace('{0}', time),
                Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT_DESC
            )
        }
    }
}
