import { Module } from '@nestjs/common';
import { CustomDynamooseModule } from '@core/customDynamoose';
import { MainSchema } from './table';
import { TableName } from '@constants';

const customDynamooseModule = CustomDynamooseModule.forFeatureAsync([
  {
    name: process.env.TABLE_NAME ?? TableName,
    useFactory: () => MainSchema,
    provide: TableName,
  },
]);

@Module({
  imports: [customDynamooseModule],
  exports: [customDynamooseModule],
})
export class SchemaModule {}
