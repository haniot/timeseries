import { Entity } from './entity'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'

export class User extends Entity implements IJSONDeserializable<User> {
    private _type?: string

    constructor(id?: string, type?: string) {
        super(id)
        this.type = type
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value
    }

    public fromJSON(json: any): User {
        if (!json) return this

        if (JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.id) super.id = json.id
        if (json.type) this.type = json.type
        return this
    }
}
