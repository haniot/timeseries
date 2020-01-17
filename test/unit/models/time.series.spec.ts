import { assert } from 'chai'
import { TimeSeries } from '../../../src/application/domain/model/time.series'
import { TimeSeriesMock } from '../../mocks/time.series.mock'
import { Summary } from '../../../src/application/domain/model/summary'

describe('MODELS: TimeSeries', () => {

    it('should return TimeSeries object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj: TimeSeries = new TimeSeriesMock()
            .generate('2019-12-01', '2019-12-31', 'heart_rate')

        const timeSeries: TimeSeries = new TimeSeries(
            expectedObj.type,
            expectedObj.dataSet,
            expectedObj.summary,
            expectedObj.patientId
        )
        assert.deepEqual(timeSeries.dataSet, expectedObj.dataSet)
        assert.deepEqual(timeSeries.summary, expectedObj.summary)
        assert.equal(timeSeries.type, expectedObj.type)
        assert.equal(timeSeries.patientId, expectedObj.patientId)
    })

    it('should return the populated TimeSeries object with the attributes set by the set methods.', () => {
        const expectedObj: TimeSeries = new TimeSeriesMock()
            .generate('2019-12-29T10:00:00.000Z', '2019-12-31T10:35:00.000Z', 'calories')

        const timeSeries: TimeSeries = new TimeSeries()
        timeSeries.dataSet = expectedObj.dataSet
        timeSeries.summary = expectedObj.summary
        timeSeries.type = 'calories'
        timeSeries.patientId = '2a62be95d6f00455195c1b62'

        assert.deepEqual(timeSeries.dataSet, expectedObj.dataSet)
        assert.deepEqual(timeSeries.summary, expectedObj.summary)
        assert.equal(timeSeries.type, 'calories')
        assert.equal(timeSeries.patientId, '2a62be95d6f00455195c1b62')
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const timeSeries: TimeSeries = new TimeSeries()

        assert.deepEqual(timeSeries.dataSet, [])
        assert.deepEqual(timeSeries.summary, new Summary())
        assert.equal(timeSeries.type, '')
        assert.equal(timeSeries.patientId, '')
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj: TimeSeries = new TimeSeriesMock()
            .generate('2019-11-01', '2019-12-31', 'distance')

        assert.deepEqual(new TimeSeries(
            expectedObj.type,
            expectedObj.dataSet,
            expectedObj.summary,
            expectedObj.patientId
        ).toJSON(), expectedObj.toJSON())
    })

    it('should return TimeSeries object according to parameter passed in function fromJSON(json): steps.', () => {
        const expectedObj: TimeSeries = new TimeSeriesMock()
            .generate('2019-12-01', '2019-12-31', 'steps')
        const json: any = expectedObj.toJSON()
        json.type = 'steps'
        json.patient_id = expectedObj.patientId

        const result = new TimeSeries().fromJSON(json)

        assert.deepEqual(result.dataSet, expectedObj.dataSet)
        assert.deepEqual(result.summary, new Summary()) // summary should not be created using function fromJSON(json)
        assert.equal(result.type, expectedObj.type)
        assert.equal(result.patientId, expectedObj.patientId)
    })

    it('should return TimeSeries object according to parameter passed in function fromJSON(json): heart_rate.', () => {
        const expectedObj: TimeSeries = new TimeSeriesMock()
            .generate('2019-12-01', '2019-12-31', 'heart_rate')
        const json: any = expectedObj.toJSON()
        json.type = 'heart_rate'
        json.patient_id = expectedObj.patientId

        const result = new TimeSeries().fromJSON(json)
        assert.deepEqual(result.dataSet, expectedObj.dataSet)
        assert.deepEqual(result.summary, new Summary()) // summary should not be created using function fromJSON(json)
        assert.equal(result.type, expectedObj.type)
        assert.equal(result.patientId, expectedObj.patientId)
    })

    it('should return TimeSeries object with default values of due invalid json ' +
        'passed in function fromJSON(json).', () => {
        const json: any = {
            data_set: {},
            user_id: {},
            summary: new Summary(150).toJSON() // not be created using function fromJSON(json)
        }
        assert.deepEqual(new TimeSeries().fromJSON(json), new TimeSeries())
        assert.deepEqual(new TimeSeries().fromJSON('{a:""{'), new TimeSeries()) // invalid json
    })

    it('should return TimeSeries object via the fromJSON(json) function, ' +
        'where json is in string format.', () => {
        const expectedObj: TimeSeries = new TimeSeriesMock()
            .generate('2019-12-01', '2019-12-25', 'active_minutes')
        const json: any = expectedObj.toJSON()
        json.type = expectedObj.type
        json.patient_id = expectedObj.patientId
        json.summary = '{ total: 150}' // not be created using function fromJSON(json)

        const result: TimeSeries = new TimeSeries().fromJSON(JSON.stringify(json))
        assert.deepEqual(result.dataSet, expectedObj.dataSet)
        assert.deepEqual(result.summary, new Summary()) // summary should not be created using function fromJSON(json)
        assert.equal(result.type, expectedObj.type)
        assert.equal(result.patientId, expectedObj.patientId)
    })

    it('should return TimeSeries object with empty data_set due to missing attribute in function call fromJSON(json).', () => {
        const expectedObj: TimeSeries = new TimeSeriesMock()
            .generate('2019-12-29', '2019-12-31', 'distance')
        const json: any = expectedObj.toJSON()
        json.type = expectedObj.type
        json.patient_id = expectedObj.patientId
        json.data_set = undefined

        const result: TimeSeries = new TimeSeries().fromJSON(json)

        assert.deepEqual(result.dataSet, [])
        assert.equal(result.type, expectedObj.type)
        assert.equal(result.patientId, expectedObj.patientId)
    })

    it('should return default TimeSeries object when parameter passed in ' +
        'function fromJSON(json) is empty.', () => {
        assert.deepEqual(new TimeSeries().fromJSON({}), new TimeSeries())
        assert.deepEqual(new TimeSeries().fromJSON(undefined), new TimeSeries())
        assert.deepEqual(new TimeSeries().fromJSON(''), new TimeSeries())
        assert.deepEqual(new TimeSeries().fromJSON(null), new TimeSeries())
    })
})
