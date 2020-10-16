import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { IIntradayTimeSeriesService } from '../../application/port/intraday.time.series.service.interface'
import { IntradayTimeSeries } from '../../application/domain/model/intraday.time.series'

@injectable()
export class RpcServerEventBusTask implements IBackgroundTask {
    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.INTRADAY_SERVICE) private readonly _intradayService: IIntradayTimeSeriesService,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public run(): void {
        this.initializeServer()
    }

    public async stop(): Promise<void> {
        try {
            await this._eventBus.dispose()
        } catch (err) {
            return Promise.reject(new Error(`Error stopping RPC Server! ${err.message}`))
        }
    }

    private initializeServer(): void {
        this._eventBus
            .provideResource('intraday.find', async (patientId: string, resource: string,
                                                     startDate: string, endDate: string,
                                                     startTime: string, endTime: string,
                                                     interval: string) => {
                try {
                    const intradayTimeSeries: IntradayTimeSeries =
                        await this._intradayService.listByIntervalAndTime(
                            patientId, resource, startDate, endDate, startTime, endTime, interval
                        )
                    return intradayTimeSeries.toJSON()
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('Resource intraday.find successful registered'))
            .catch((err) => this._logger.error(`Error at register resource intraday.find: ${err.message}`))
    }
}
