import { Global, Logger, Module } from '@nestjs/common';
import { SchemaModule } from '@schemas/module';
import { DynamooseModule } from 'nestjs-dynamoose';
import { PackagesModule } from './packages/packages.module';
import { ProjectsModule } from './projects/projects.module';
import { VulnsModule } from './vulns/vulns.module';

const logger = new Logger('DynamoDB');

@Global()
@Module({ imports: [SchemaModule], exports: [SchemaModule] })
export class GlobalSchema {}

@Module({
  imports: [
    process.env.NODE_ENV === 'production'
      ? DynamooseModule.forRoot({ aws: { region: process.env.REGION }, logger })
      : DynamooseModule.forRoot({
          local: true,
          aws: { region: 'local' },
          logger,
        }),
    GlobalSchema,
    PackagesModule,
    ProjectsModule,
    VulnsModule,
  ],
})
export class HttpModule {}
