export interface IEntityMapper<M, EM> {
    transform(item: any): any

    modelToModelEntity(item: M): EM

    jsonToModel(json: any): M
}
