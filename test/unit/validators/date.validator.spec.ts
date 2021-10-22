import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { DateValidator } from '../../../src/application/domain/validator/date.validator'
import { Strings } from '../../../src/utils/strings'

describe('VALIDATORS: DateValidator', () => {
    context('when date is in invalid format.', () => {
        it('should throw ValidationException with date in invalid format 12-12-2019.', () => {
            try {
                DateValidator.validate('12-12-2019')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with date in invalid format 2019-12-011.', () => {
            try {
                DateValidator.validate('2019-12-011')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with date in invalid format 2019-12-32.', () => {
            try {
                DateValidator.validate('2019-12-32')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with message and invalid date description.', () => {
            const date = '2019-13-10'
            try {
                DateValidator.validate(date)
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
                assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', date))
                assert.equal(e.description, Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT_DESC)
            }
        })

        it('should throw ValidationException with invalid date message: 2019-11-31,' +
            ' because month 11 does not have day 31.', () => {
            const date = '2019-11-31'
            try {
                DateValidator.validate(date)
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
                assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', date))
            }
        })

        it('should throw ValidationException when year is less than 1678.', () => {
            const date = '1677-01-01'
            try {
                DateValidator.validate(date)
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
                assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.YEAR_NOT_ALLOWED.replace('{0}', date))
            }
        })

        it('should throw ValidationException when the year is greater than 2261.', () => {
            const date = '2262-01-01'
            try {
                DateValidator.validate(date)
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
                assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.YEAR_NOT_ALLOWED.replace('{0}', date))
            }
        })
    })

    context('when date is in valid format.', () => {
        it('should not throw ValidationException with date in valid format 2019-12-14', () => {
            try {
                DateValidator.validate('2019-12-14')
            } catch (err: any) {
                assert.fail(err)
            }
        })

        it('should not throw ValidationException for date 2020-02-29 in leap year.', () => {
            try {
                DateValidator.validate('2020-02-29')
            } catch (err: any) {
                assert.fail(err)
            }
        })
    })
})
