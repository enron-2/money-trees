import { DynamicModule, flatten } from '@nestjs/common';
import { DynamooseModule, getModelToken } from 'nestjs-dynamoose';
import { AsyncModelFactory } from 'nestjs-dynamoose/dist/interfaces/async-model-factory.interface';
import { DYNAMOOSE_INITIALIZATION } from 'nestjs-dynamoose/dist/dynamoose.constants';
import * as dynamoose from 'dynamoose';

/**
 * Extends base AsyncModelFactory from nestjs-dynamoose
 * With optional provider token
 */
export interface CustomAsyncModelFactory extends AsyncModelFactory {
  provide?: string;
}

/**
 * Accepts provider token in forFeatureAsync static method
 */
export class CustomDynamooseModule extends DynamooseModule {
  static forFeatureAsync(factories?: CustomAsyncModelFactory[]): DynamicModule {
    const providers = (factories || []).map((model) => [
      {
        provide: getModelToken(model.provide ?? model.name),
        useFactory: async (...args: unknown[]) => {
          const schema = await model.useFactory(...args);
          const modelInstance = dynamoose.model(
            model.name,
            schema,
            model.options
          );
          if (model.serializers) {
            Object.entries(model.serializers).forEach(([key, value]) => {
              modelInstance.serializer.add(key, value);
            });
          }
          return modelInstance;
        },
        inject: [DYNAMOOSE_INITIALIZATION, ...(model.inject || [])],
      },
    ]);
    const imports = factories.map((factory) => factory.imports || []);
    const uniqImports = new Set(flatten(imports));
    const flatProviders = flatten(providers);
    return {
      module: DynamooseModule,
      imports: [...uniqImports],
      providers: flatProviders,
      exports: flatProviders,
    };
  }
}
