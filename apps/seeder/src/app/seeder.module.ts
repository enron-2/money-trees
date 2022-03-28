import { Module } from '@nestjs/common';
import { SchemaModule } from '@schemas/module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    DynamooseModule.forRoot({
      local: true,
      aws: { region: 'local' },
    }),
    SchemaModule,
  ],
  providers: [SeederService],
})
export class SeederModule {}
