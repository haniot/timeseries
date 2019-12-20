import { injectable } from 'inversify'

@injectable()
export class BackgroundService {
    // private container: Container

    constructor() {
        // this.container = DI.getInstance().getContainer()
    }

    public async startServices(): Promise<void> {
        try {
            // ot
        } catch (err) {
            return Promise.reject(new Error(`Error initializing services in background! ${err.message}`))
        }
    }

    public async stopServices(): Promise<void> {
        try {
            // not
        } catch (err) {
            return Promise.reject(new Error(`Error stopping background services! ${err.message}`))
        }
    }

    // /**
    //  * Retrieve the URI for connection to MongoDB.
    //  *
    //  * @return {string}
    //  */
    // private getDBUri(): string {
    //     if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
    //         return process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST
    //     }
    //     return process.env.MONGODB_URI || Default.MONGODB_URI
    // }
}
