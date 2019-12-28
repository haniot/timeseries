import { injectable } from 'inversify'
import { ILogger } from '../../../utils/custom.logger'
import { RepositoryException } from '../../../application/domain/exception/repository.exception'
import { Strings } from '../../../utils/strings'

@injectable()
export abstract class BaseRepository {
    protected constructor(
        protected readonly _logger: ILogger
    ) {
        // Not implemented!
    }

    protected dbErrorListener(err?: any): RepositoryException {
        this._logger.error(err)
        return new RepositoryException(Strings.ERROR_MESSAGE.UNEXPECTED)
    }
}
