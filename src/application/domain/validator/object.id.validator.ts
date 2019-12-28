import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class ObjectIdValidator {
    public static validate(uuid: string): void | ValidationException {
        if (!(/^[a-fA-F0-9]{24}$/.test(uuid))) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT.replace('{0}', uuid),
                Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC
            )
        }
    }
}
