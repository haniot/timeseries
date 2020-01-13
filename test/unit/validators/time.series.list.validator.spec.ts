import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Strings } from '../../../src/utils/strings'
import { TimeSeriesListValidator } from '../../../src/application/domain/validator/time.series.list.validator'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'

describe('VALIDATORS: TimeSeriesListValidator', () => {
    context('when parameters are invalid.', () => {
        context('patient ID.', () => {
            it('should throw ValidationException when patient ID has invalid format: Za62bA07de34500146d9c544.', () => {
                const id = 'Za62bA07de34500146d9c544'
                try {
                    TimeSeriesListValidator.validate(id,
                        '2018-11-16', '2019-11-01', 'steps')
                    assert.fail()
                } catch (e) {
                    assert.instanceOf(e, ValidationException)
                    assert.equal(e.message, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT.replace('{0}', id))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                }
            })
        })

        context('resource type.', () => {
            it('should throw ValidationException when resource is invalid: temperature.', () => {
                const timeSeriesTypes = Object.keys(TimeSeriesType).map(key => TimeSeriesType[key])
                try {
                    TimeSeriesListValidator.validate('5a62be07de34500146d9c544',
                        '2018-11-16', '2019-11-01', 'temperature')
                    assert.fail()
                } catch (e) {
                    assert.instanceOf(e, ValidationException)
                    assert.equal(e.message, Strings.ERROR_MESSAGE.RESOURCE_NOT_SUPPORTED
                        .replace('{0}', 'temperature'))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.RESOURCE_SUPPORTED
                        .replace('{0}', timeSeriesTypes.join(', ')))
                }
            })
        })

        context('start and end date.', () => {
            it('should throw ValidationException with message and invalid start date description.', () => {
                const date = '2019-13-105'
                try {
                    TimeSeriesListValidator.validate('5a62be07de34500146d9c544',
                        date, '2019-12-15', 'steps')
                    assert.fail()
                } catch (e) {
                    assert.instanceOf(e, ValidationException)
                    assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', date))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT_DESC)
                }
            })

            it('should throw ValidationException when end date is less than start date: 2019-12-16 and 2019-12-10.', () => {
                try {
                    TimeSeriesListValidator.validate('5a62be07de34500146d9c544',
                        '2019-12-16', '2019-12-10', 'steps')
                    assert.fail()
                } catch (e) {
                    assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.RANGE_INVALID
                        .replace('{0}', '2019-12-16')
                        .replace('{1}', '2019-12-10'))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.DATE.RANGE_INVALID_DESC)
                    assert.instanceOf(e, ValidationException)
                }
            })

            it('should throw ValidationException when the difference between start and end date exceeds 365 days.', () => {
                try {
                    TimeSeriesListValidator.validate('5a62be07de34500146d9c544',
                        '2018-11-16', '2019-12-16', 'steps')
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
    })

    context('when parameters are valid.', () => {
        it('should not throw ValidationException with parameters are valid.', () => {
            try {
                TimeSeriesListValidator.validate('5a62be07de34500146d9c544',
                    '2019-12-15', '2019-12-25', 'steps')
            } catch (e) {
                assert.fail(e)
            }
        })
    })
})
