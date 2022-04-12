import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SchemaModule } from '@schemas/module';
import { DynamooseModule } from 'nestjs-dynamoose';

export class TestModule {
  static imports() {
    return [
      DynamooseModule.forRoot({
        local: true,
        aws: { region: 'local' },
      }),
      {
        module: SchemaModule,
        global: true,
      },
    ];
  }

  static pipes(app: INestApplication) {
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          exposeUnsetFields: false,
          excludeExtraneousValues: true,
        },
      })
    );
  }

  static interceptors(app: INestApplication) {
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector))
    );
  }
}
