import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Strings } from '../../../src/utils/strings'
import { TimeValidator } from '../../../src/application/domain/validator/time.validator'

describe('VALIDATORS: TimeValidator', () => {
    context('when time is in invalid format.', () => {
        it('should throw ValidationException with date in invalid format 12-02-59.', () => {
            try {
                TimeValidator.validate('12-02-59')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with date in invalid format 12/02/59.', () => {
            try {
                TimeValidator.validate('12/02/59')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with date in invalid format 2:02:45.', () => {
            try {
                TimeValidator.validate('2-02-45')
                assert.fail()
            } catch (e: any) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with message and description when hour is < 0 and > 23.', () => {
            const times: Array<string> = ['-15:02:12', '-0:02:12', '24:02:12', '59:02:12']
            for (const time of times) {
                try {
                    TimeValidator.validate(time)
                    assert.fail()
                } catch (e: any) {
                    assert.equal(e.message, Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT.replace('{0}', time))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT_DESC)
                }
            }
        })

        it('should throw ValidationException with message and description when minutes/seconds is < 0 and > 59.', () => {
            const times: Array<string> = ['15:-0:00', '10:-15:00', '10:60:00', '10:59:60']
            for (const time of times) {
                try {
                    TimeValidator.validate(time)
                    assert.fail()
                } catch (e: any) {
                    assert.equal(e.message, Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT.replace('{0}', time))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT_DESC)
                }
            }
        })
    })

    context('when time is in valid format.', () => {
        it('should not throw ValidationException with time in valid format 10:45:00', () => {
            try {
                TimeValidator.validate('10:45:00')
            } catch (err: any) {
                assert.fail(err)
            }
        })

        it('should not throw ValidationException with time in valid format 10:45', () => {
            try {
                TimeValidator.validate('10:45')
            } catch (err: any) {
                assert.fail(err)
            }
        })
    })
})
