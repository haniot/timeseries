import { assert } from 'chai'
import { ApiExceptionManager } from '../../../src/ui/exception/api.exception.manager'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { ApiException } from '../../../src/ui/exception/api.exception'
import { RepositoryException } from '../../../src/application/domain/exception/repository.exception'
import { EventBusException } from '../../../src/application/domain/exception/eventbus.exception'

describe('EXCEPTIONS: ApiExceptionManager', () => {
    it('should return transform ValidationException object to ApiException with code 400, message and description.', () => {
        const exception: ApiException = ApiExceptionManager.build(
            new ValidationException('ValidationException message', 'ValidationException description')
        )

        assert.equal(exception.code, 400)
        assert.equal(exception.message, 'ValidationException message')
        assert.equal(exception.description, 'ValidationException description')
    })

    it('should return transform ValidationException object to ApiException with code 400 and message.', () => {
        const exception: ApiException = ApiExceptionManager.build(new ValidationException('ValidationException message'))

        assert.equal(exception.code, 400)
        assert.equal(exception.message, 'ValidationException message')
        assert.equal(exception.description, undefined)
    })

    it('should return transform RepositoryException object to ApiException with code 500, message and description.', () => {
        const exception: ApiException = ApiExceptionManager.build(
            new RepositoryException('RepositoryException message', 'RepositoryException description')
        )

        assert.equal(exception.code, 500)
        assert.equal(exception.message, 'RepositoryException message')
        assert.equal(exception.description, 'RepositoryException description')
    })

    it('should return transform RepositoryException object to ApiException with code 500 and message.', () => {
        const exception: ApiException = ApiExceptionManager.build(new RepositoryException('RepositoryException message'))

        assert.equal(exception.code, 500)
        assert.equal(exception.message, 'RepositoryException message')
        assert.equal(exception.description, undefined)
    })

    it('should return transform EventBusException object to ApiException with code 500, message and description.', () => {
        const exception: ApiException = ApiExceptionManager.build(
            new EventBusException('EventBusException message', 'EventBusException description')
        )

        assert.equal(exception.code, 500)
        assert.equal(exception.message, 'EventBusException message')
        assert.equal(exception.description, 'EventBusException description')
    })

    it('should return transform EventBusException object to ApiException with code 500 and message.', () => {
        const exception: ApiException = ApiExceptionManager.build(new EventBusException('EventBusException message'))

        assert.equal(exception.code, 500)
        assert.equal(exception.message, 'EventBusException message')
        assert.equal(exception.description, undefined)
    })

    it('should return transform Error object to ApiException with code 500, message and description.', () => {
        const exception: ApiException = ApiExceptionManager.build(new Error('Error message'))

        assert.equal(exception.code, 500)
        assert.equal(exception.message, 'Error message')
        assert.equal(exception.description, undefined)
    })
})
