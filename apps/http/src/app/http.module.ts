import { Global, Logger, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchemaModule } from '@schemas/module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as Joi from 'joi';
import { DynamooseModule } from 'nestjs-dynamoose';
import { PackagesModule } from './packages/packages.module';
import { ProjectsModule } from './projects/projects.module';
import { VulnsModule } from './vulns/vulns.module';
import { join } from 'path';

const logger = new Logger('DynamoDB');

@Global()
@Module({ imports: [SchemaModule], exports: [SchemaModule] })
export class GlobalSchema {}

const mainModule: ModuleMetadata = {
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
};

@Module(mainModule)
export class HttpModule {}

/**
 * Same with HttpModule, but serve static asssets, use only in dev
 * Only for modules that's not in use in production
 */
@Module({
  ...mainModule,
  imports: [
    ...mainModule.imports,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'assets'),
      serveRoot: '/assets',
    }),
  ],
})
export class DevHttpModule {}
