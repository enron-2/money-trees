import { Logger, Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { SchemaModule } from '@schemas/module';
import { PackageController } from './package.controller';
import { ProjectController } from './project.controller';
import { VulnController } from './vuln.controller';

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
  controllers: [PackageController, ProjectController, VulnController],
})
export class HttpModule {}
