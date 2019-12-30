import { ILogger } from '../../src/utils/custom.logger'

export class CustomLoggerMock implements ILogger {
    public _logger: any

    constructor() {
        this._logger = {
            add: {},
            debug: (message: string) => message,
            error: (message: string) => message,
            info: (message: string) => message,
            warn: (message: string) => message
        }
    }

    public addTransport(transport: any): any {
        return this._logger.add(transport)
    }

    get logger(): any {
        return this._logger
    }

    public debug(message: string): void {
        this._logger.debug(message)
    }

    public error(message: string): void {
        this._logger.error(message)
    }

    public info(message: string): void {
        this._logger.info(message)
    }

    public warn(message: string): void {
        this._logger.warn(message)
    }
}
