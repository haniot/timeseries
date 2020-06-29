/**
 * Class that defines variables with default values.
 *
 * @see Variables defined in .env will have preference.
 * @see Be careful not to put critical data in this file as it is not in .gitignore.
 * Sensitive data such as database, passwords and keys should be stored in secure locations.
 *
 * @abstract
 */
export abstract class Default {
    public static readonly APP_ID: string = 'timeseries.app'
    public static readonly NODE_ENV: string = 'development' // development, test, production
    public static readonly PORT_HTTP: number = 8000
    public static readonly PORT_HTTPS: number = 8001
    public static readonly SWAGGER_URI: string = 'https://api.swaggerhub.com/apis/haniot/timeseries/v1/swagger.json'
    public static readonly LOGO_URI: string = 'https://i.imgur.com/O7PxGWQ.png'

    // InfluxDB
    public static readonly INFLUXDB_HOST: string = 'localhost'
    public static readonly INFLUXDB_PORT: number = 8086
    public static readonly INFLUXDB_NAME: string = 'haniot-timeseries'
    public static readonly INFLUXDB_NAME_TEST: string = 'haniot-timeseries-test'
    public static readonly INFLUXDB_PROTOCOL: string = 'http'
    public static readonly MEASUREMENT_HR_ZONES_NAME: string = 'heart_rate_zones'
    public static readonly MEASUREMENT_TIMESERIES_NAME: string = 'intraday_timeseries'

    // RabbitMQ
    public static readonly RABBITMQ_URI: string = 'amqp://guest:guest@localhost:5672'

    // Log
    public static readonly LOG_DIR: string = 'logs'

    // Certificate
    // To generate self-signed certificates, see: https://devcenter.heroku.com/articles/ssl-certificate-self
    public static readonly SSL_KEY_PATH: string = '.certs/server.key'
    public static readonly SSL_CERT_PATH: string = '.certs/server.crt'
}
