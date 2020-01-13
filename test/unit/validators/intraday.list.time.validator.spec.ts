import { IntradayListTimeValidator } from '../../../src/application/domain/validator/intraday.list.time.validator'
import { assert } from 'chai'
import { ValidationException } from '../../../src/application/domain/exception/validation.exception'
import { Strings } from '../../../src/utils/strings'
import { TimeSeriesType } from '../../../src/application/domain/utils/time.series.type'

describe('VALIDATORS: IntradayListTimeValidator', () => {
    context('when parameters are invalid.', () => {
        context('patient ID.', () => {
            it('should throw ValidationException when patient ID has invalid format: Za62bA07de34500146d9c544.', () => {
                const id = 'Za62bA07de34500146d9c544'
                try {
                    IntradayListTimeValidator.validate(id, 'steps',
                        '2018-11-16', '2018-11-16',
                        '00:00:00', '02:00:00', '1s')
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
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        'temperature', '2018-11-16', '2018-11-16',
                        '00:00:00', '02:00:00', '1s')
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
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        'steps', date, '2018-11-17',
                        '00:00:00', '02:00:00', '1s')
                    assert.fail()
                } catch (e) {
                    assert.instanceOf(e, ValidationException)
                    assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', date))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT_DESC)
                }
            })

            it('should throw ValidationException with message and invalid end date description.', () => {
                const date = '2019-11-31'
                try {
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        'steps', '2019-11-30', date,
                        '00:00:00', '02:00:00', '1s')
                    assert.fail()
                } catch (e) {
                    assert.instanceOf(e, ValidationException)
                    assert.equal(e.message, Strings.ERROR_MESSAGE.DATE.INVALID_FORMAT.replace('{0}', date))
                }
            })

            it('should throw ValidationException when date and time exceeds 24h.', () => {
                try {
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        'steps', '2019-12-16', '2019-12-18',
                        '00:00:00', '00:00:00', '1sec')
                    assert.fail()
                } catch (e) {
                    assert.equal(e.message, Strings.ERROR_MESSAGE.TIME.RANGE_INVALID)
                    assert.equal(e.description, Strings.ERROR_MESSAGE.TIME.RANGE_INVALID_DESC)
                    assert.instanceOf(e, ValidationException)
                }
            })
        })

        context('start and end time.', () => {
            it('should throw ValidationException with message and invalid start time description.', () => {
                const time = '24:00:00'
                try {
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        'steps', '2018-11-17', '2018-11-17',
                        time, '02:00:00', '1s')
                    assert.fail()
                } catch (e) {
                    assert.instanceOf(e, ValidationException)
                    assert.equal(e.message, Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT.replace('{0}', time))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT_DESC)
                }
            })

            it('should throw ValidationException with message and invalid end time description.', () => {
                const time = '00:60:00'
                try {
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        'steps', '2018-11-17', '2018-11-17',
                        '02:00:00', time, '1s')
                    assert.fail()
                } catch (e) {
                    assert.instanceOf(e, ValidationException)
                    assert.equal(e.message, Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT.replace('{0}', time))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.TIME.INVALID_FORMAT_DESC)
                }
            })

            it('should throw ValidationException when date and time exceeds 24h.', () => {
                try {
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        'steps', '2019-12-16', '2019-12-17',
                        '00:00:00', '23:59:59', '1s')
                    assert.fail()
                } catch (e) {
                    assert.equal(e.message, Strings.ERROR_MESSAGE.TIME.RANGE_INVALID)
                    assert.equal(e.description, Strings.ERROR_MESSAGE.TIME.RANGE_INVALID_DESC)
                    assert.instanceOf(e, ValidationException)
                }
            })
        })

        context('interval.', () => {
            it('should throw ValidationException when range is not allowed.', () => {
                const interval = '60m'
                try {
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        'steps', '2018-11-17', '2018-11-17',
                        '00:00:00', '02:00:00', interval)
                    assert.fail()
                } catch (e) {
                    assert.instanceOf(e, ValidationException)
                    assert.equal(e.message, Strings.ERROR_MESSAGE.INTERVAL_NOT_SUPPORTED.replace('{0}', interval))
                    assert.equal(e.description, Strings.ERROR_MESSAGE.INTERVAL_SUPPORTED)
                }
            })
        })
    })

    context('when parameters are valid.', () => {
        it('should not throw ValidationException with parameters are valid.', () => {
            try {
                IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                    'steps', '2018-11-17', '2018-11-17',
                    '00:00:00', '02:00:00', '1m')
            } catch (e) {
                assert.fail(e)
            }
        })

        it('should not throw ValidationException with times in the format hh:mm and hh:mm:ss.', () => {
            try {
                IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                    'steps', '2018-11-17', '2018-11-17',
                    '00:00', '02:00:00', '1m')
            } catch (e) {
                assert.fail(e)
            }
        })

        it('should not throw ValidationException for resources: ' +
            'steps, calories, distance, active_minutes and heart_rate.', () => {
            try {
                const resources: Array<string> = ['steps', 'calories', 'distance', 'active_minutes', 'heart_rate']
                for (const resource of resources) {
                    IntradayListTimeValidator.validate('5a62be07de34500146d9c544',
                        resource, '2018-11-17', '2018-11-17',
                        '00:00', '02:00:00', '1s')
                }
            } catch (e) {
                assert.fail(e)
            }
        })
    })
})
