import { assert } from 'chai'
import { User } from '../../../src/application/domain/model/user'

describe('Models: User', () => {
    const userJSON: any = {
        id: '5a62be07d6f33400146c9b61',
        type: 'patient'
    }

    describe('fromJSON()', () => {
        context('when the json is correct', () => {
            it('should return a user model', () => {
                const result = new User().fromJSON(userJSON)
                assert.propertyVal(result, 'id', userJSON.id)
                assert.propertyVal(result, 'type', userJSON.type)
            })
        })

        context('when the json is empty', () => {
            it('should return a user model with undefined parameters', () => {
                const result = new User().fromJSON({})
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'type', undefined)
            })
        })

        context('when the json is undefined', () => {
            it('should return a user model with undefined parameters', () => {
                const result = new User().fromJSON(undefined)
                assert.propertyVal(result, 'id', undefined)
                assert.propertyVal(result, 'type', undefined)
            })
        })

        context('when the json is a string', () => {
            it('should transform the string in json and return User model', () => {
                const result = new User().fromJSON(JSON.stringify(userJSON))
                assert.propertyVal(result, 'id', userJSON.id)
                assert.propertyVal(result, 'type', userJSON.type)
            })
        })
    })
})
