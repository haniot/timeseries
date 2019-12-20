import { controller } from 'inversify-express-utils'
import { inject } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'

@controller('/v1/patients/{patient_id}')
export class PatientsTimeSeriesController {
    constructor(
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
    }
}
