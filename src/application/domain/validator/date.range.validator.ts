import { ValidationException } from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'

export class DateRangeValidator {
    public static validate(startDate: string, endDate: string): void | ValidationException {
        const diffDays: number = DateRangeValidator.dateDiffInDays(new Date(startDate), new Date(endDate))
        const message: string = Strings.ERROR_MESSAGE.DATE.RANGE_INVALID
            .replace('{0}', startDate)
            .replace('{1}', endDate)

        if (diffDays < 0) {
            throw new ValidationException(message, Strings.ERROR_MESSAGE.DATE.RANGE_INVALID_DESC)
        }

        if (diffDays > DateRangeValidator.getLimitDays(startDate, endDate)) {
            throw new ValidationException(message, Strings.ERROR_MESSAGE.DATE.RANGE_EXCEED_YEAR_DESC)
        }
    }

    public static dateDiffInDays(a: Date, b: Date): number {
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
        return Math.floor((utc2 - utc1) / 8.64e+7)
    }

    private static getLimitDays(startDate: string, endDate: string): number {
        const parts1 = startDate.split('-')
        const parts2 = endDate.split('-')
        const year1: number = parseInt(parts1[0], 10)
        const year2: number = parseInt(parts2[0], 10)

        const month1: number = parseInt(parts1[1], 10)
        const month2: number = parseInt(parts2[1], 10)

        if (month1 < 2 && month2 < 2) return 365

        // make sure the year of the dates is leap
        if ((year1 % 400 === 0 || (year1 % 100 !== 0 && year1 % 4 === 0)) ||
            (year2 % 400 === 0 || (year2 % 100 !== 0 && year2 % 4 === 0))) {
            return 366
        }
        return 365
    }
}
