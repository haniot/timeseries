import 'reflect-metadata'
import { Container } from 'inversify'
import { HomeController } from '../ui/controller/home.controller'
import { Identifier } from './identifiers'
import { IConnectionFactory } from '../infrastructure/port/connection.factory.interface'
import { BackgroundService } from '../background/background.service'
import { App } from '../app'
import { CustomLogger, ILogger } from '../utils/custom.logger'
import { ConnectionFactoryRabbitMQ } from '../infrastructure/eventbus/rabbitmq/connection.factory.rabbitmq'
import { IConnectionEventBus } from '../infrastructure/port/connection.event.bus.interface'
import { ConnectionRabbitMQ } from '../infrastructure/eventbus/rabbitmq/connection.rabbitmq'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { EventBusRabbitMQ } from '../infrastructure/eventbus/rabbitmq/eventbus.rabbitmq'
import { ConnectionFactoryInfluxDB } from '../infrastructure/database/connection.factory.infludb'
import { ConnectionInfluxDB } from '../infrastructure/database/connection.influxdb'
import { IDatabase } from '../infrastructure/port/database.interface'
import { ITimeSeriesService } from '../application/port/timeseries.service.interface'
import { TimeSeriesService } from '../application/service/time.series.service'
import { IIntradayTimeSeriesService } from '../application/port/intraday.time.series.service.interface'
import { IntradayTimeSeriesService } from '../application/service/intraday.time.series.service'
import { ITimeSeriesRepository } from '../application/port/timeseries.repository.interface'
import { TimeSeriesRepository } from '../infrastructure/repository/time.series.repository'
import { IIntradayTimeSeriesRepository } from '../application/port/intraday.time.series.repository.interface'
import { IntradayTimeSeriesRepository } from '../infrastructure/repository/intraday.time.series.repository'
import { TimeSeriesController } from '../ui/controller/timeseries.controller'
import { IEntityMapper } from '../infrastructure/port/entity.mapper.interface'
import { TimeSeries } from '../application/domain/model/time.series'
import { TimeSeriesEntity } from '../infrastructure/entity/time.series.entity'
import { TimeSeriesEntityMapper } from '../infrastructure/entity/mapper/time.series.entity.mapper'
import { IntradayTimeSeriesController } from '../ui/controller/intraday.timeseries.controller'
import { IntradayTimeSeriesEntityMapper } from '../infrastructure/entity/mapper/intraday.time.series.entity.mapper'
import { IntradayTimeSeries } from '../application/domain/model/intraday.time.series'
import { IntradayTimeSeriesEntity } from '../infrastructure/entity/intraday.time.series.entity'
import { SubscribeEventBusTask } from '../background/task/subscribe.event.bus.task'

class IoC {
    private readonly _container: Container

    /**
     * Creates an instance of DI.
     *
     * @private
     */
    constructor() {
        this._container = new Container()
        this.initDependencies()
    }

    get container(): Container {
        return this._container
    }

    /**
     * Initializes injectable containers.
     *
     * @private
     * @return void
     */
    private initDependencies(): void {
        this._container.bind(Identifier.APP).to(App).inSingletonScope()

        // Controllers
        this._container.bind<HomeController>(Identifier.HOME_CONTROLLER)
            .to(HomeController).inSingletonScope()
        this._container.bind<TimeSeriesController>(Identifier.TIMESERIES_CONTROLLER)
            .to(TimeSeriesController).inSingletonScope()
        this._container.bind<IntradayTimeSeriesController>(Identifier.INTRADAY_CONTROLLER)
            .to(IntradayTimeSeriesController).inSingletonScope()

        // Services
        this._container.bind<ITimeSeriesService>(Identifier.TIMESERIES_SERVICE)
            .to(TimeSeriesService).inSingletonScope()
        this._container.bind<IIntradayTimeSeriesService>(Identifier.INTRADAY_SERVICE)
            .to(IntradayTimeSeriesService).inSingletonScope()

        // Repositories
        this._container.bind<ITimeSeriesRepository>(Identifier.TIMESERIES_REPOSITORY)
            .to(TimeSeriesRepository).inSingletonScope()
        this._container.bind<IIntradayTimeSeriesRepository>(Identifier.INTRADAY_REPOSITORY)
            .to(IntradayTimeSeriesRepository).inSingletonScope()

        // Mappers
        this.container
            .bind<IEntityMapper<TimeSeries, TimeSeriesEntity>>(Identifier.TIME_SERIES_ENTITY_MAPPER)
            .to(TimeSeriesEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<IntradayTimeSeries, IntradayTimeSeriesEntity>>(Identifier.INTRADAY_ENTITY_MAPPER)
            .to(IntradayTimeSeriesEntityMapper).inSingletonScope()

        // Background Services
        this._container
            .bind<IConnectionFactory>(Identifier.INFLUXDB_CONNECTION_FACTORY)
            .to(ConnectionFactoryInfluxDB).inSingletonScope()
        this._container
            .bind<IDatabase>(Identifier.INFLUXDB_CONNECTION)
            .to(ConnectionInfluxDB).inSingletonScope()
        this._container
            .bind<IConnectionFactory>(Identifier.RABBITMQ_CONNECTION_FACTORY)
            .to(ConnectionFactoryRabbitMQ).inSingletonScope()
        this._container
            .bind<IConnectionEventBus>(Identifier.RABBITMQ_CONNECTION)
            .to(ConnectionRabbitMQ)
        this._container
            .bind<IEventBus>(Identifier.RABBITMQ_EVENT_BUS)
            .to(EventBusRabbitMQ).inSingletonScope()
        this._container
            .bind(Identifier.BACKGROUND_SERVICE)
            .to(BackgroundService).inSingletonScope()

        // Tasks
        this._container
            .bind(Identifier.SUBSCRIBE_EVENT_BUS_TASK)
            .to(SubscribeEventBusTask).inSingletonScope()

        // Log
        this._container.bind<ILogger>(Identifier.LOGGER).to(CustomLogger).inSingletonScope()
    }
}

export const DIContainer = new IoC().container
