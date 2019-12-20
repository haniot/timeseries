import { IJSONSerializable } from '../utils/json.serializable.interface'

export class Summary implements IJSONSerializable {
    private _total: number

    constructor(total: number) {
        this._total = total
    }

    get total(): number {
        return this._total
    }

    set total(value: number) {
        this._total = value
    }

    public toJSON(): any {
        return {
            total: this.total
        }
    }
}
