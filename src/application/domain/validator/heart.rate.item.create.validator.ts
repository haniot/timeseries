import { ValidationException } from '../exception/validation.exception'
import { DateValidator } from './date.validator'
import { HeartRateItem } from '../model/heart.rate.item'
import { Strings } from '../../../utils/strings'
import { HeartRateZoneType } from '../utils/heart.rate.zone.type'
import { HeartRateZoneData } from '../model/heart.rate.zone.data'

export class HeartRateItemCreateValidator {
    public static validate(hrItem: HeartRateItem): void | ValidationException {
        const fields: Array<string> = []

        const validateZone = (zone: HeartRateZoneData) => {
            if (!Number(zone.min) || zone.min < 0) fields.push(`${zone.type}.min`)
            if (!Number(zone.max) || zone.max < 0) fields.push(`${zone.type}.max`)
        }

        if (!hrItem.date) fields.push('date')
        else DateValidator.validate(hrItem.date)

        if (!hrItem.zones.outOfRange) fields.push(HeartRateZoneType.OUT_OF_RANGE)
        else validateZone(hrItem.zones.outOfRange)

        if (!hrItem.zones.fatBurn) fields.push(HeartRateZoneType.FAT_BURN)
        else validateZone(hrItem.zones.fatBurn)

        if (!hrItem.zones.cardio) fields.push(HeartRateZoneType.CARDIO)
        else validateZone(hrItem.zones.cardio)

        if (!hrItem.zones.peak) fields.push(HeartRateZoneType.PEAK)
        else validateZone(hrItem.zones.peak)

        if (fields.length) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.VALIDATE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.REQUIRED_FIELDS_DESC.replace('{0}', fields.join(', '))
            )
        }
    }
}
