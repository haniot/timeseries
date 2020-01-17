import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'
import { HeartRateZoneType } from '../utils/heart.rate.zone.type'
import { HeartRateZoneData } from '../model/heart.rate.zone.data'
import { HeartRateZone } from '../model/heart.rate.zone'
import { NumberPositiveValidator } from './number.positive.validator'
import { IntegerPositiveValidator } from './integer.positive.validator'

export class HeartRateZonesSyncValidator {
    public static validate(zones: HeartRateZone): void | ValidationException {
        const requiredZones: Array<string> = []
        const invalidFields: Array<string> = []
        const regZone = new RegExp(/^0*[1-9][0-9]*$/i) // 1-n

        const validateZone = (zone: HeartRateZoneData) => {
            if (!(regZone.test(String(zone.min)))) invalidFields.push(`${zone.type}.min`)
            if (!(regZone.test(String(zone.max)))) invalidFields.push(`${zone.type}.max`)
            if (zone.calories) NumberPositiveValidator.validate(zone.calories.toString())
            if (zone.duration) IntegerPositiveValidator.validate(zone.duration.toString())
        }

        if (!zones.outOfRange) requiredZones.push(HeartRateZoneType.OUT_OF_RANGE)
        else validateZone(zones.outOfRange)

        if (!zones.fatBurn) requiredZones.push(HeartRateZoneType.FAT_BURN)
        else validateZone(zones.fatBurn)

        if (!zones.cardio) requiredZones.push(HeartRateZoneType.CARDIO)
        else validateZone(zones.cardio)

        if (!zones.peak) requiredZones.push(HeartRateZoneType.PEAK)
        else validateZone(zones.peak)

        if (requiredZones.length) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.VALIDATE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.REQUIRED_FIELDS_DESC.replace('{0}', requiredZones.join(', '))
            )
        }

        if (invalidFields.length) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.VALIDATE.REQUIRED_FIELDS_NOT_VALID.replace('{0}', invalidFields.join(', ')),
                Strings.ERROR_MESSAGE.VALIDATE.NUMBER_GREATER_ZERO
            )
        }
    }
}
