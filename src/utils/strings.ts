/**
 * Class that defines variables with default values.
 *
 * @see Variables defined in .env will have preference.
 * @see Be careful not to put critical data in this file as it is not in .gitignore.
 * Sensitive data such as database, passwords and keys should be stored in secure locations.
 *
 * @abstract
 */
export abstract class Strings {
    public static readonly APP: any = {
        TITLE: 'HANIoT Time Series Service',
        APP_DESCRIPTION: 'Microservice responsible for time series on the HANIoT platform.'
    }

    public static readonly ERROR_MESSAGE: any = {
        ENDPOINT_NOT_FOUND: 'Endpoint {0} does not found!',
        REQUEST_BODY_INVALID: 'Unable to process request body!',
        REQUEST_BODY_INVALID_DESC: 'Please verify that the JSON provided in the request body has a valid format and try again.',
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...',
        UUID_NOT_VALID_FORMAT: 'The ID {0} does not have a valid format!',
        UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.',
        INTERNAL_SERVER_ERROR: 'An internal server error has occurred.',
        INTERNAL_SERVER_ERROR_DESC: 'Check all parameters of the operation being requested.',
        RESOURCE_NOT_SUPPORTED: 'Resource {0} not supported!',
        RESOURCE_SUPPORTED: 'Only the following resources types are supported: {0}.',
        INTERVAL_NOT_SUPPORTED: 'Interval {0} not supported!',
        INTERVAL_SUPPORTED: 'Only the following intervals types are supported: 1sec, 15sec, 1min or 15min.',
        CONNECTION_NOT_EXIST: 'Instance of database connection does not exist!',
        VALIDATE: {
            REQUIRED_FIELDS: 'Required fields were not provided...',
            REQUIRED_FIELDS_DESC: '{0} are required!',
            VALUE: 'Value {0} is not valid!',
            VALUE_DESC: 'Must be a number equal to or greater than zero...'
        },
        DATE: {
            YEAR_NOT_ALLOWED: 'Date {0} has year not allowed. The year must be greater than 1678 and less than 2261.',
            INVALID_FORMAT: 'Date {0} is not valid!',
            INVALID_FORMAT_DESC: 'Date must be in the format: yyyy-MM-dd',
            INVALID_DATETIME_FORMAT: 'Datetime {0} is not valid!',
            INVALID_DATETIME_FORMAT_DESC: 'Datetime must be in the format: yyyy-MM-ddTHH:mm:ssZ',
            RANGE_INVALID: 'The interval between dates {0} and {1} is invalid!',
            RANGE_INVALID_DESC: 'The end_date parameter can not contain an older date than that the start_date parameter.',
            RANGE_EXCEED_YEAR_DESC: 'The period between the received dates can not exceed 1 year.'
        },
        TIME: {
            INVALID_FORMAT: 'Time {0} is not valid!',
            INVALID_FORMAT_DESC: 'Time must be in the format: hh:mm:ss or hh:mm.',
            RANGE_INVALID: 'The interval between dates and times is invalid!',
            RANGE_INVALID_DESC: 'The period between the two dates and times cannot exceed 24 hours.'
        }
    }
}
