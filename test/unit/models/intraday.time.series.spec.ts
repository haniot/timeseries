import { assert } from 'chai'
import { IntradayTimeSeries } from '../../../src/application/domain/model/intraday.time.series'
import { IntradayTimeSeriesMock } from '../../mocks/intraday.time.series.mock'
import { IntradaySummary } from '../../../src/application/domain/model/intraday.summary'

describe('MODELS: IntradayTimeSeries', () => {

    it('should return IntradayTimeSeries object with the correct values ​​according to values ​​set in the builder.', () => {
        const expectedObj: IntradayTimeSeries = new IntradayTimeSeriesMock()
            .generate('2019-12-30T03:00:00.000Z', '2019-12-31T02:59:59.000Z', 'heart_rate')

        const intradayTimeSeries: IntradayTimeSeries = new IntradayTimeSeries(
            expectedObj.type,
            expectedObj.dataSet,
            expectedObj.summary,
            expectedObj.patientId
        )
        assert.deepEqual(intradayTimeSeries.dataSet, expectedObj.dataSet)
        assert.deepEqual(intradayTimeSeries.summary, expectedObj.summary)
        assert.equal(intradayTimeSeries.type, expectedObj.type)
        assert.equal(intradayTimeSeries.patientId, expectedObj.patientId)
    })

    it('should return the populated IntradayTimeSeries object with the attributes set by the set methods.', () => {
        const expectedObj: IntradayTimeSeries = new IntradayTimeSeriesMock()
            .generate('2019-12-29T10:00:00.000Z', '2019-12-31T10:35:00.000Z', 'calories')

        const intradayTimeSeries: IntradayTimeSeries = new IntradayTimeSeries()
        intradayTimeSeries.dataSet = expectedObj.dataSet
        intradayTimeSeries.summary = expectedObj.summary
        intradayTimeSeries.type = 'calories'
        intradayTimeSeries.patientId = '2a62be95d6f00455195c1b62'

        assert.deepEqual(intradayTimeSeries.dataSet, expectedObj.dataSet)
        assert.deepEqual(intradayTimeSeries.summary, expectedObj.summary)
        assert.equal(intradayTimeSeries.type, 'calories')
        assert.equal(intradayTimeSeries.patientId, '2a62be95d6f00455195c1b62')
    })

    it('should return default values ​​when creating object without setting parameters in builder.', () => {
        const intradayTimeSeries: IntradayTimeSeries = new IntradayTimeSeries()

        assert.deepEqual(intradayTimeSeries.dataSet, [])
        assert.deepEqual(intradayTimeSeries.summary, new IntradaySummary())
        assert.equal(intradayTimeSeries.type, '')
        assert.equal(intradayTimeSeries.patientId, '')
    })

    it('should return json object with expected attributes when calling toJSON() function.', () => {
        const expectedObj: IntradayTimeSeries = new IntradayTimeSeriesMock()
            .generate('2019-12-29T10:00:00.000Z', '2019-12-31T10:35:00.000Z', 'distance')

        assert.deepEqual(new IntradayTimeSeries(
            expectedObj.type,
            expectedObj.dataSet,
            expectedObj.summary,
            expectedObj.patientId
        ).toJSON(), expectedObj.toJSON())
    })

    it('should return IntradayTimeSeries object according to parameter passed in function fromJSON(json): steps.', () => {
        const expectedObj: IntradayTimeSeries = new IntradayTimeSeriesMock()
            .generate('2019-12-29T10:00:00.000Z', '2019-12-31T11:25:00.000Z', 'steps')
        const json: any = expectedObj.toJSON()
        json.type = 'steps'
        json.patient_id = expectedObj.patientId

        const result = new IntradayTimeSeries().fromJSON(json)

        assert.deepEqual(result.dataSet, expectedObj.dataSet)
        assert.equal(result.type, expectedObj.type)
        assert.equal(result.patientId, expectedObj.patientId)
    })

    it('should return IntradayTimeSeries object according to parameter passed in function fromJSON(json): heart_rate.', () => {
        const expectedObj: IntradayTimeSeries = new IntradayTimeSeriesMock()
            .generate('2019-12-29T10:00:00.000Z', '2019-12-31T11:25:00.000Z', 'heart_rate')
        const json: any = expectedObj.toJSON()
        json.type = 'heart_rate'
        json.patient_id = expectedObj.patientId

        const result = new IntradayTimeSeries().fromJSON(json)

        assert.deepEqual(result.dataSet, expectedObj.dataSet)
        assert.equal(result.type, expectedObj.type)
        assert.equal(result.patientId, expectedObj.patientId)
    })

    it('should return IntradayTimeSeries object with default values of due invalid json ' +
        'passed in function fromJSON(json).', () => {
        const json: any = {
            data_set: {},
            user_id: {},
            summary: new IntradaySummary('2019-12-29T10:00:00.000Z').toJSON()
        }
        assert.deepEqual(new IntradayTimeSeries().fromJSON(json), new IntradayTimeSeries())
        assert.deepEqual(new IntradayTimeSeries().fromJSON('{a:""{'), new IntradayTimeSeries()) // invalid json
    })

    it('should return IntradayTimeSeries object via the fromJSON(json) function, ' +
        'where json is in string format.', () => {
        const expectedObj: IntradayTimeSeries = new IntradayTimeSeriesMock()
            .generate('2019-12-29T10:00:00.000Z', '2019-12-31T10:35:00.000Z', 'active_minutes')
        const json: any = expectedObj.toJSON()
        json.type = expectedObj.type
        json.patient_id = expectedObj.patientId

        const result: IntradayTimeSeries = new IntradayTimeSeries().fromJSON(JSON.stringify(json))
        assert.deepEqual(result.dataSet, expectedObj.dataSet)
        assert.deepEqual(result.summary, new IntradaySummary()) // summary should not be created using function fromJSON(json)
        assert.equal(result.type, expectedObj.type)
        assert.equal(result.patientId, expectedObj.patientId)
    })

    it('should return IntradayTimeSeries object with empty data_set due to missing attribute in function call fromJSON(json).', () => {
        const expectedObj: IntradayTimeSeries = new IntradayTimeSeriesMock()
            .generate('2019-12-29T09:10:15.000Z', '2019-12-31T09:55:00.000Z', 'distance')
        const json: any = expectedObj.toJSON()
        json.type = expectedObj.type
        json.patient_id = expectedObj.patientId
        json.data_set = undefined

        const result: IntradayTimeSeries = new IntradayTimeSeries().fromJSON(json)

        assert.deepEqual(result.dataSet, [])
        assert.equal(result.type, expectedObj.type)
        assert.equal(result.patientId, expectedObj.patientId)
    })

    it('should return default IntradayTimeSeries object when parameter passed in ' +
        'function fromJSON(json) is empty.', () => {
        assert.deepEqual(new IntradayTimeSeries().fromJSON({}), new IntradayTimeSeries())
        assert.deepEqual(new IntradayTimeSeries().fromJSON(undefined), new IntradayTimeSeries())
        assert.deepEqual(new IntradayTimeSeries().fromJSON(''), new IntradayTimeSeries())
        assert.deepEqual(new IntradayTimeSeries().fromJSON(null), new IntradayTimeSeries())
    })
})
