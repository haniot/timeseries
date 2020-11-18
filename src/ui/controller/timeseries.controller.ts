import { controller, httpGet, request, response } from 'inversify-express-utils'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Request, Response } from 'express'
import { ITimeSeriesService } from '../../application/port/timeseries.service.interface'
import { TimeSeries } from '../../application/domain/model/time.series'
import { TimeSeriesGroup } from '../../application/domain/model/time.series.group'

@controller('/v1/patients/:user_id')
export class TimeSeriesController {
    constructor(
        @inject(Identifier.TIMESERIES_SERVICE) private readonly _timeseriesService: ITimeSeriesService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Retrieve the time series of all supported features associated with an user except heart rate.
     * Available resources: steps, calories, distance, active_minutes.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/date/:start_date/:end_date/timeseries')
    public async getAllTimeSeries(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: TimeSeriesGroup = await this._timeseriesService
                .listAll(req.params.user_id, req.params.start_date, req.params.end_date)
            return res.status(200).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }

    /**
     * Retrieves the time series of a resource associated with an user.
     *
     * @param req
     * @param res
     */
    @httpGet('/:resource/date/:start_date/:end_date/timeseries')
    public async getTimeSeriesByType(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const result: TimeSeries = await this._timeseriesService
                .listByType(req.params.user_id, req.params.start_date, req.params.end_date, req.params.resource)
            return res.status(200).send(result)
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJSON())
        }
    }
}
