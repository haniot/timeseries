import { EventType, IntegrationEvent } from './integration.event'
import { User } from '../../domain/model/user'
import { IntradayTimeSeries } from '../../domain/model/intraday.time.series'

export class IntradayTimeSeriesSyncEvent extends IntegrationEvent<IntradayTimeSeries> {
    public static readonly ROUTING_KEY: string = 'intraday.timeseries.sync'

    constructor(public timestamp?: Date, public user?: User) {
        super('IntradayTimeSeriesSyncEvent', EventType.TIMESERIES, timestamp)
    }
}
