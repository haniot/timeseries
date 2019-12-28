import { IJSONSerializable } from '../utils/json.serializable.interface'

export class HeartRateSummary implements IJSONSerializable {
    private _outOfRangeTotal: number
    private _fatBurnTotal: number
    private _cardioTotal: number
    private _peakTotal: number

    constructor(outOfRangeTotal?: number, fatBurnTotal?: number, cardioTotal?: number, peakTotal?: number) {
        this._outOfRangeTotal = outOfRangeTotal !== undefined ? outOfRangeTotal : 0
        this._fatBurnTotal = fatBurnTotal !== undefined ? fatBurnTotal : 0
        this._cardioTotal = cardioTotal !== undefined ? cardioTotal : 0
        this._peakTotal = peakTotal !== undefined ? peakTotal : 0
    }

    get fatBurnTotal(): number {
        return this._fatBurnTotal
    }

    set fatBurnTotal(value: number) {
        this._fatBurnTotal = value
    }

    get cardioTotal(): number {
        return this._cardioTotal
    }

    set cardioTotal(value: number) {
        this._cardioTotal = value
    }

    get peakTotal(): number {
        return this._peakTotal
    }

    set peakTotal(value: number) {
        this._peakTotal = value
    }

    get outOfRangeTotal(): number {
        return this._outOfRangeTotal
    }

    set outOfRangeTotal(value: number) {
        this._outOfRangeTotal = value
    }

    public toJSON(): any {
        return {
            out_of_range_total: this.outOfRangeTotal,
            fat_burn_total: this.fatBurnTotal,
            cardio_total: this.cardioTotal,
            peak_total: this.peakTotal
        }
    }
}
