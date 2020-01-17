import HttpStatus from 'http-status-codes'
import { Exception } from '../../application/domain/exception/exception'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import { ApiException } from './api.exception'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { EventBusException } from '../../application/domain/exception/eventbus.exception'

/**
 * Treats the exception types of the application and converts
 * to api exception which should be returned in json format for the client.
 *
 * @abstract
 */
export abstract class ApiExceptionManager {

    /**
     * Constructs instance of ApiException.
     *
     * @param err
     */
    public static build(err: Exception): ApiException {
        if (err instanceof ValidationException) {
            return new ApiException(HttpStatus.BAD_REQUEST, err.message, err.description)
        } else if (err instanceof RepositoryException || err instanceof EventBusException) {
            return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err.description)
        }
        return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err.description)
    }
}
