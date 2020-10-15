import { inject } from 'inversify'
import { Request, Response } from 'express'
import { controller, httpGet, request, response } from 'inversify-express-utils'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { IIntradayTimeSeriesService } from '../../application/port/intraday.time.series.service.interface'
import { IntradayTimeSeries } from '../../application/domain/model/intraday.time.series'

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
                    req.params.date,
                    req.params.interval
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
                    req.params.start_date,
                    req.params.end_date,
                    req.params.start_time,
                    req.params.end_time,
                    req.params.interval
                )
            return res.status(200).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }
}
