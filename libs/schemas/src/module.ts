import { Module } from '@nestjs/common';
import { CustomDynamooseModule } from '@core/customDynamoose';
import { MainSchema } from './table';

const customDynamooseModule = CustomDynamooseModule.forFeatureAsync([
  {
    name: process.env.TABLE_NAME ?? 'MainTable',
    useFactory: () => MainSchema,
    provide: 'MainTable',
  },
]);

@Module({
  imports: [customDynamooseModule],
  exports: [customDynamooseModule],
})
export class SchemaModule {}
