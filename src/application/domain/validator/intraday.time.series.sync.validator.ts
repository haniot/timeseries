import { ObjectIdValidator } from './object.id.validator'
import { ResourceTypeValidator } from './resource.type.validator'
import { TimeSeriesType } from '../utils/time.series.type'
import { HeartRateZonesSyncValidator } from './heart.rate.zones.sync.validator'
import { IntradayTimeSeries } from '../model/intraday.time.series'
import { NumberPositiveValidator } from './number.positive.validator'
import { IntegerPositiveValidator } from './integer.positive.validator'
import { DatetimeValidator } from './datetime.validator'
import { TimeValidator } from './time.validator'
import { IntradayHeartRateSummary } from '../model/intraday.heart.rate.summary'
import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class IntradayTimeSeriesSyncValidator {
    public static validate(intraday: IntradayTimeSeries): void | ValidationException {
        const fields: Array<string> = []

        if (!intraday.patientId) fields.push('patient_id')
        else ObjectIdValidator.validate(intraday.patientId)

        if (!intraday.type) fields.push('type')
        else ResourceTypeValidator.validate(intraday.type)

        if (!intraday.summary.startTime) fields.push('start_time')
        else DatetimeValidator.validate(intraday.summary.startTime)

        if (fields.length) {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.VALIDATE.REQUIRED_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.REQUIRED_FIELDS_NOT_VALID.replace('{0}', fields.join(', '))
            )
        }

        if (intraday.type === TimeSeriesType.HEART_RATE) {
            HeartRateZonesSyncValidator.validate((intraday.summary as IntradayHeartRateSummary).zones)
        }

        // steps, calories, distance, active_minutes or heart_rate
        intraday.dataSet.forEach((elem: any) => {
            TimeValidator.validate(elem.time)

            if (intraday.type === TimeSeriesType.CALORIES || intraday.type === TimeSeriesType.DISTANCE) {
                // Can be integer or decimal
                NumberPositiveValidator.validate(elem.value)
            } else { // steps, active_minutes and heart_rate
                IntegerPositiveValidator.validate(elem.value)
            }
        })
    }
}
