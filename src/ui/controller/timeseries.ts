import HttpStatus from 'http-status-codes'
import { controller, httpGet, request, response } from 'inversify-express-utils'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { Request, Response } from 'express'

@controller('/v1/patients/:patient_id')
export class TimeSeriesController {
    constructor(
        // @inject(Identifier.TIMESERIES_SERVICE) private readonly _timeseriesService: ITimeSeriesService,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }

    /**
     * Retrieve the time series of all supported features associated with a patient except heart rate.
     * Available resources: steps, calories, distance, active_minutes.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/date/:start_date/:end_date/timeseries')
    public async getAllTimeSeries(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            return res.status(HttpStatus.OK).send({
                patient_id: req.params.patient_id,
                start_date: req.params.start_date,
                end_date: req.params.end_date
            })
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Retrieve the time series of all supported features associated with a patient except heart rate.
     * Available resources: steps, calories, distance, active_minutes.
     *
     * @param {Request} req
     * @param {Response} res
     */
    @httpGet('/:resource/date/:start_date/:end_date/timeseries')
    public async getTimeSeriesByType(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            return res.status(HttpStatus.OK).send({
                patient_id: req.params.patient_id,
                start_date: req.params.start_date,
                end_date: req.params.end_date
            })
        } catch (err) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code)
                .send(handlerError.toJson())
        }
    }

    /**
     * Convert object to json format expected by view.
     *
     * @param healthProfessional
     */
}
