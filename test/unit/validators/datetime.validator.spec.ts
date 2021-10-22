import { assert } from 'chai'
import { DatetimeValidator } from '../../../src/application/domain/validator/datetime.validator'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Strings } from '../../../src/utils/strings'

describe('VALIDATORS: DatetimeValidator', () => {
    context('when datetime is in invalid format.', () => {
        it('should throw ValidationException with date in invalid format 12-12-2019 12:52:59.', () => {
            try {
                DatetimeValidator.validate('12-12-2019 12:52:59')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with date in invalid format 2019-12-011T12:52:59Z.', () => {
            try {
                DatetimeValidator.validate('2019-12-011T12:52:59Z')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with date in invalid format 2019-12-32T12:52:59Z.', () => {
            try {
                DatetimeValidator.validate('2019-12-32T12:52:59Z')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with message and invalid datetime description.', () => {
            const date = '2019-13-10T12:52:59Z'
            try {
                DatetimeValidator.validate(date)
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
                assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.INVALID_DATETIME_FORMAT.replace('{0}', date))
                assert.equal(e.description, Strings.ERROR_MESSAGE.DATE.INVALID_DATETIME_FORMAT_DESC)
            }
        })
    })

    context('when datetime is in valid format.', () => {
        it('should not throw ValidationException with date in valid format 2019-12-14T12:52:59Z', () => {
            try {
                DatetimeValidator.validate('2019-12-14T12:52:59Z')
            } catch (err: any) {
                assert.fail(err)
            }
        })

        it('should not throw ValidationException with date in valid format 2019-12-26T17:58:43.155Z', () => {
            try {
                DatetimeValidator.validate('2019-12-26T17:58:43.155Z')
            } catch (err: any) {
                assert.fail(err)
            }
        })

        it('should not throw ValidationException with date in valid format 2019-12-14T12:52:59', () => {
            try {
                DatetimeValidator.validate('2019-12-14T12:52:59')
            } catch (err: any) {
                assert.fail(err)
            }
        })
    })
})
