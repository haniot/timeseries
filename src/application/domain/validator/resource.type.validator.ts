import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { TimeSeriesType } from '../utils/time.series.type'

export class ResourceTypeValidator {
    public static validate(type: string): void | ValidationException {
        const timeSeriesTypes = Object.keys(TimeSeriesType).map(key => TimeSeriesType[key])
        if (!timeSeriesTypes.includes(type)) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.RESOURCE_NOT_SUPPORTED.replace('{0}', type),
                Strings.ERROR_MESSAGE.RESOURCE_SUPPORTED.replace('{0}', timeSeriesTypes.join(', '))
            )
        }
    }
}
