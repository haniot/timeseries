import { assert } from 'chai'
import { ObjectIdValidator } from '../../../src/application/domain/validator/object.id.validator'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Strings } from '../../../src/utils/strings'

describe('VALIDATORS: ObjectIdValidator', () => {
    context('when ObjectId is in invalid format', () => {
        it('should throw ValidationException with ObjectId in invalid format abc123.', () => {
            try {
                ObjectIdValidator.validate('abc123')
                assert.fail()
            } catch (e) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with ObjectId in invalid format 5a62be07zy34500146d9c544.', () => {
            try {
                ObjectIdValidator.validate('5a62be07zy34500146d9c544')
                assert.fail()
            } catch (e) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with ObjectId in invalid format ""', () => {
            try {
                ObjectIdValidator.validate('')
                assert.fail()
            } catch (e) {
                assert.instanceOf(e, ValidationException)
            }
        })

        it('should throw ValidationException with message and invalid ' +
            'ObjectId description: 507f1f77bcf86cd799439011d.', () => {
            const id = '507f1f77bcf86cd799439011d'
            try {
                ObjectIdValidator.validate(id)
                assert.fail()
            } catch (e) {
                assert.instanceOf(e, ValidationException)
                assert.equal(e.message, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT.replace('{0}', id))
                assert.equal(e.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
            }
        })
    })

    context('when ObjectId is in valid format', () => {
        it('should not throw ValidationException with ObjectId in valid format 5a62be07de34500146d9c544.', () => {
            try {
                ObjectIdValidator.validate('5a62be07de34500146d9c544')
            } catch (err) {
                assert.fail(err)
            }
        })

        it('should not throw ValidationException with ObjectId in valid format 5a62be07de34500146d9c544.', () => {
            try {
                ObjectIdValidator.validate('5a62be07de34500146d9c544')
            } catch (err) {
                assert.fail(err)
            }
        })

        it('should not throw ValidationException with ObjectId in valid format 000000000000000000000000.', () => {
            try {
                ObjectIdValidator.validate('000000000000000000000000')
            } catch (e) {
                assert.fail(e)
            }
        })

        it('should not throw ValidationException with ObjectId in valid format 111111111111111111111111.', () => {
            try {
                ObjectIdValidator.validate('111111111111111111111111')
            } catch (e) {
                assert.fail(e)
            }
        })
    })
})
