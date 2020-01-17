import { FieldType, ISchemaOptions } from 'influx'
import { Default } from '../../../utils/default'

export const intradayTimeSeriesSchema: ISchemaOptions = {
    measurement: Default.MEASUREMENT_TIMESERIES_NAME,
    fields: {
        value: FieldType.FLOAT
    },
    tags: [
        'user_id', 'type'
    ]
}
