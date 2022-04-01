import { DynamicModule, flatten, Module } from '@nestjs/common';
import { DynamooseModule, getModelToken } from 'nestjs-dynamoose';
import { AsyncModelFactory } from 'nestjs-dynamoose/dist/interfaces/async-model-factory.interface';
import { DYNAMOOSE_INITIALIZATION } from 'nestjs-dynamoose/dist/dynamoose.constants';
import * as dynamoose from 'dynamoose';
import { createPackageSchema } from './packages';
import { createProjectSchema } from './projects';
import { createVulnerabilitySchema } from './vulnerabilities';
import { Package, Project, Vuln } from './tablenames';

interface CustomAsyncModelFactory extends AsyncModelFactory {
  provide?: string;
}
class CustomDynamooseModule extends DynamooseModule {
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

const customDynamooseModule = CustomDynamooseModule.forFeatureAsync([
  {
    name: process.env.VULN_TABLE ?? Vuln,
    provide: Vuln,
    useFactory: () => createVulnerabilitySchema(),
  },
  {
    name: process.env.PACKAGE_TABLE ?? Package,
    provide: Package,
    inject: ['VulnModel'],
    useFactory: (_, model) => createPackageSchema(model),
  },
  {
    name: process.env.PROJECT_TABLE ?? Project,
    provide: Project,
    inject: ['PackageModel'],
    useFactory: (_, model) => createProjectSchema(model),
  },
]);

@Module({
  imports: [customDynamooseModule],
  exports: [customDynamooseModule],
})
export class SchemaModule {}
