import { Entity } from './entity'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'

export class User extends Entity implements IJSONDeserializable<User> {
    private _type?: string

    constructor(id?: string, type?: string) {
        super(id)
        this._type = type
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value
    }

    public fromJSON(json: any): User {
        if (json.id) super.id = json.id
        if (json.type) this.type = json.type
        return this
    }
}
