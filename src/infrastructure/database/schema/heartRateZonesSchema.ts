import { FieldType, ISchemaOptions } from 'influx'
import { Default } from '../../../utils/default'

export const heartRateZonesSchema: ISchemaOptions = {
    measurement: Default.MEASUREMENT_HR_ZONES_NAME,
    fields: {
        max: FieldType.INTEGER,
        min: FieldType.INTEGER,
        value: FieldType.INTEGER,
        calories: FieldType.FLOAT
    },
    tags: [
        'user_id', 'type'
    ]
}
