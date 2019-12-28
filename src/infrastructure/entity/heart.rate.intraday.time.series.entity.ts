export class HeartRateIntradayTimeSeriesEntity {
    public start_time?: string
    public end_time?: string
    public min?: number
    public max?: number
    public average?: number
    public interval?: string
    public fat_burn_zone?: any
    public cardio_zone?: any
    public peak_zone?: any
    public out_of_range_zone?: any
    public data_set?: Array<any>
}
