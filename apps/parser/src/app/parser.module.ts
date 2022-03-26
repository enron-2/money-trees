import { Logger, Module } from '@nestjs/common';
import { SchemaModule } from '@schemas/module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ParserService } from './parser.service';

const logger = new Logger('DynamoDB');

@Module({
  imports: [
    process.env.NODE_ENV === 'production'
      ? DynamooseModule.forRoot({ aws: { region: process.env.REGION }, logger })
      : DynamooseModule.forRoot({
          local: true,
          aws: { region: 'local' },
          logger,
        }),
    SchemaModule,
  ],
  providers: [ParserService],
})
export class ParserModule {}
