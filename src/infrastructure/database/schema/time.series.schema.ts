import { FieldType, ISchemaOptions } from 'influx'
import { Default } from '../../../utils/default'

export const timeSeriesSchema: ISchemaOptions = {
    measurement: Default.MEASUREMENT_NAME,
    fields: {
        value: FieldType.FLOAT
    },
    tags: [
        'user_id', 'type'
    ]
}
