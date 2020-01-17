import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class IntegerPositiveValidator {
    public static validate(value: string): void | ValidationException {
        if (!(/^[0-9]{1,}$/i).test(value)) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.VALIDATE.INVALID_NUMBER.replace('{0}', value),
                Strings.ERROR_MESSAGE.VALIDATE.POSITIVE_INTEGER
            )
        }
    }
}
