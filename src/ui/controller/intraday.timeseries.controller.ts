import moment from 'moment'
import { inject } from 'inversify'
import { Request, Response } from 'express'
import { controller, httpGet, request, response } from 'inversify-express-utils'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { IIntradayTimeSeriesService } from '../../application/port/intraday.time.series.service.interface'
import { IntradayTimeSeries } from '../../application/domain/model/intraday.time.series'
import { TimeSeriesType } from '../../application/domain/utils/time.series.type'

@controller('/v1/patients/:patient_id/:resource')
export class IntradayTimeSeriesController {
    constructor(
        @inject(Identifier.INTRADAY_SERVICE) private readonly _intradayService: IIntradayTimeSeriesService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Retrieves the intraday time series of a resource associated with a patient.
     * Note: It goes from 00:00:00 to 23:59:59. Or, until the current time if the date is the current day.
     *
     * @param {Request} req
     * @param {Response} res
     */
        @httpGet('/date/:date/interval/:interval/timeseries')
    public async getTimeSeriesIntraday(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: IntradayTimeSeries = await this._intradayService
                .listByInterval(
                    req.params.patient_id,
                    req.params.resource,
                    this.buildDate(req.params.date),
                    this.buildInterval(req.params.interval, req.params.resource)
                )
            return res.status(200).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Retrieves the intraday time series of a resource associated with a patient.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/date/:start_date/:end_date/time/:start_time/:end_time/interval/:interval/timeseries')
    public async getTimeSeriesIntradayByTime(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: IntradayTimeSeries = await this._intradayService
                .listByIntervalAndTime(
                    req.params.patient_id,
                    req.params.resource,
                    this.buildDate(req.params.start_date),
                    this.buildDate(req.params.end_date),
                    req.params.start_time,
                    req.params.end_time,
                    this.buildInterval(req.params.interval, req.params.resource)
                )
            return res.status(200).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    private buildInterval(interval: string, type: string): string {
        if (type === TimeSeriesType.HEART_RATE) return interval
        if (interval === '1s' || interval === '15s') interval = interval.replace('s', 'm')
        return interval
    }

    private buildDate(date: string): string {
        return date === 'today' ? moment().format('YYYY-MM-DD') : date
    }
}
