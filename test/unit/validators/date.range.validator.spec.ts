import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Strings } from '../../../src/utils/strings'
import { DateRangeValidator } from '../../../src/application/domain/validator/date.range.validator'

describe('VALIDATORS: DateRangeValidator', () => {
    context('when the date range is invalid.', () => {
        it('should throw ValidationException between dates 2019-12-16 and 2019-12-10.', () => {
            try {
                DateRangeValidator.validate('2019-12-16', '2019-12-10')
                assert.fail()
            } catch (e) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with message and description when the difference' +
            ' between start and end date exceeds 365 days.', () => {
            try {
                DateRangeValidator.validate('2018-11-16', '2019-12-16')
                assert.fail()
            } catch (e) {
                assert.instanceOf(e, ValidationException)
                assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.RANGE_INVALID
                    .replace('{0}', '2018-11-16')
                    .replace('{1}', '2019-12-16'))
                assert.equal(e.description, Strings.ERROR_MESSAGE.DATE.RANGE_EXCEED_YEAR_DESC)
            }
        })
    })

    context('when the date range is valid.', () => {
        it('should not throw ValidationException with between dates 2019-12-16 and 2019-12-25.', () => {
            try {
                DateRangeValidator.validate('2019-12-16', '2019-12-25')
            } catch (err) {
                assert.fail(err)
            }
        })

        it('should not throw ValidationException with between dates 2018-12-25 and 2019-12-25.', () => {
            try {
                DateRangeValidator.validate('2018-12-25', '2019-12-25')
            } catch (err) {
                assert.fail(err)
            }
        })
    })

    context('dateDiffInDays() function.', () => {
        it('should return the correct total of days between dates 2019-11-14 and 2019-12-16.', () => {
            try {
                const result = DateRangeValidator
                    .dateDiffInDays(new Date('2019-11-14'), new Date('2019-12-16'))
                assert.equal(result, 32)
            } catch (err) {
                assert.fail(err)
            }
        })

        it('should return negative total days between dates 2019-12-16 and 2019-11-14.', () => {
            try {
                const result = DateRangeValidator
                    .dateDiffInDays(new Date('2019-12-16'), new Date('2019-11-14'))
                assert.equal(result, -32)
            } catch (err) {
                assert.fail(err)
            }
        })

        it('should return 0 days between dates 2019-12-16 and 2019-12-16.', () => {
            try {
                const result = DateRangeValidator
                    .dateDiffInDays(new Date('2019-12-16'), new Date('2019-12-16'))
                assert.equal(result, 0)
            } catch (err) {
                assert.fail(err)
            }
        })

        it('should return the correct total of days between date time ' +
            '2019-12-26T17:58:43.155Z and 2018-12-26T17:58:43.155Z.', () => {
            try {
                const result = DateRangeValidator
                    .dateDiffInDays(new Date('2018-12-26T23:59:59.999Z'), new Date('2019-12-26T17:58:43.155Z'))
                assert.equal(result, 365)
            } catch (err) {
                assert.fail(err)
            }
        })
    })
})
