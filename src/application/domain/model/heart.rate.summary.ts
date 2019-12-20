import { IJSONSerializable } from '../utils/json.serializable.interface'

export class HeartRateSummary implements IJSONSerializable {
    private _fat_burn_total: number
    private _cardio_total: number
    private _peak_total: number
    private _out_of_range_total: number

    constructor(fat_burn_total: number, cardio_total: number, peak_total: number, out_of_range_total: number) {
        this._fat_burn_total = fat_burn_total
        this._cardio_total = cardio_total
        this._peak_total = peak_total
        this._out_of_range_total = out_of_range_total
    }

    get fat_burn_total(): number {
        return this._fat_burn_total
    }

    set fat_burn_total(value: number) {
        this._fat_burn_total = value
    }

    get cardio_total(): number {
        return this._cardio_total
    }

    set cardio_total(value: number) {
        this._cardio_total = value
    }

    get peak_total(): number {
        return this._peak_total
    }

    set peak_total(value: number) {
        this._peak_total = value
    }

    get out_of_range_total(): number {
        return this._out_of_range_total
    }

    set out_of_range_total(value: number) {
        this._out_of_range_total = value
    }

    public toJSON(): any {
        return {
            fat_burn_total: this.fat_burn_total,
            cardio_total: this.cardio_total,
            peak_total: this.peak_total,
            out_of_range_total: this.out_of_range_total
        }
    }
}
