export interface IIntegrationEventHandler<T> {
    handle(event: T): Promise<void>
}
