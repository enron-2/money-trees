import { Global, Logger, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchemaModule } from '@schemas/module';
import * as Joi from 'joi';
import { DynamooseModule } from 'nestjs-dynamoose';
import { PackagesModule } from './packages/packages.module';
import { ProjectsModule } from './projects/projects.module';
import { VulnsModule } from './vulns/vulns.module';

const logger = new Logger('DynamoDB');

@Global()
@Module({ imports: [SchemaModule], exports: [SchemaModule] })
export class GlobalSchema {}

export const MainModule: ModuleMetadata = {
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DYNA_PORT: Joi.number().min(0).default(8000),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),
    process.env.NODE_ENV === 'production'
      ? DynamooseModule.forRoot({ logger })
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
};

@Module(MainModule)
export class HttpModule {}
