import { FieldType, ISchemaOptions } from 'influx'
import { Default } from '../../../utils/default'

export const heartRateTimeSeriesSchema: ISchemaOptions = {
    measurement: Default.MEASUREMENT_HR_NAME,
    fields: {
        value: FieldType.INTEGER,
        calories: FieldType.FLOAT,
        max: FieldType.INTEGER,
        min: FieldType.INTEGER
    },
    tags: [
        'user_id', 'type'
    ]
}
