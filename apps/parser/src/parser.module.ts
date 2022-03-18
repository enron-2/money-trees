import { Logger, Module } from '@nestjs/common';
import { SchemaModule } from '@schemas/module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ParserService } from './parser.service';

@Module({
  imports: [
    DynamooseModule.forRoot({
      local: true,
      aws: { region: 'local' },
      logger: new Logger('DynamoDB'),
    }),
    SchemaModule,
  ],
  providers: [ParserService],
})
export class ParserModule {}
