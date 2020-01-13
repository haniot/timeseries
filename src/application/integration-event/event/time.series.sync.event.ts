import { EventType, IntegrationEvent } from './integration.event'
import { TimeSeries } from '../../domain/model/time.series'

export class TimeSeriesSyncEvent extends IntegrationEvent<TimeSeries> {
    public static readonly ROUTING_KEY: string = 'timeseries.sync'

    constructor(public timestamp?: Date, public timeseries?: TimeSeries) {
        super('TimeSeriesSyncEvent', EventType.TIMESERIES, timestamp)
    }
}
