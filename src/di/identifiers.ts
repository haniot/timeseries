/**
 * Constants used in dependence injection.
 *
 * @abstract
 */
export abstract class Identifier {
    public static readonly APP: any = Symbol.for('App')

    // Controllers
    public static readonly HOME_CONTROLLER: any = Symbol.for('HomeController')
    public static readonly TIMESERIES_CONTROLLER: any = Symbol.for('TimeSeriesController')

    // Services
    public static readonly TIMESERIES_SERVICE: any = Symbol.for('TimeSeriesService')
    public static readonly INTRADAY_SERVICE: any = Symbol.for('IntradayTimeSeriesService')

    // Repositories
    public static readonly INFLUXDB_CONNECTION_FACTORY: any = Symbol.for('InfluxDBConnectionFactory')
    public static readonly INFLUXDB_CONNECTION: any = Symbol.for('ConnectionInfluxDB')
    public static readonly TIMESERIES_REPOSITORY: any = Symbol.for('TimeSeriesRepository')
    public static readonly INTRADAY_REPOSITORY: any = Symbol.for('IntradayRepository')

    // Models

    // Mappers

    // Background Services
    public static readonly RABBITMQ_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryRabbitMQ')
    public static readonly RABBITMQ_CONNECTION: any = Symbol.for('ConnectionRabbitMQ')
    public static readonly RABBITMQ_EVENT_BUS: any = Symbol.for('EventBusRabbitMQ')
    public static readonly BACKGROUND_SERVICE: any = Symbol.for('BackgroundService')
    public static readonly SUBSCRIBE_EVENT_BUS_TASK: any = Symbol.for('SubscribeEventBusTask')

    // Tasks

    // Log
    public static readonly LOGGER: any = Symbol.for('CustomLogger')
}
