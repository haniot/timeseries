import { UserValidator } from '../../../src/application/domain/validator/user.validator'
import { User } from '../../../src/application/domain/model/user'
import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'

describe('VALIDATORS: UserValidator', () => {
    context('when parameters are invalid.', () => {
        it('should throw ValidationException with ObjectId in invalid format abc123.', () => {
            try {
                UserValidator.validate(new User('abc123'))
                assert.fail('should throw ValidationException!')
            } catch (e) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with ObjectId is undefined.', () => {
            try {
                UserValidator.validate(new User())
                assert.fail('should throw ValidationException!')
            } catch (e) {
                assert.instanceOf(e, ValidationException)
            }
        })
    })

    context('when parameters are valid.', () => {
        it('should throw ValidationException with ObjectId in valid format.', () => {
            try {
                UserValidator.validate(new User('5a62be07d6f33400146c9b61'))
                UserValidator.validate(new User('5a62be07d6f33400146c9b61', 'patient'))
            } catch (e) {
                assert.fail(e)
            }
        })
    })
})
