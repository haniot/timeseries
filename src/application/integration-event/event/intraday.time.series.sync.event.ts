import { EventType, IntegrationEvent } from './integration.event'
import { User } from '../../domain/model/user'
import { IntradayTimeSeries } from '../../domain/model/intraday.time.series'

export class IntradayTimeSeriesSyncEvent extends IntegrationEvent<IntradayTimeSeries> {
    public static readonly ROUTING_KEY: string = 'intraday.sync'

    constructor(public timestamp?: Date, public intraday?: User) {
        super('IntradayTimeSeriesSyncEvent', EventType.TIMESERIES, timestamp)
    }
}
