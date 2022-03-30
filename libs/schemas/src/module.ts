import { Module } from '@nestjs/common';
import { DynamooseModule } from 'nestjs-dynamoose';
import { createPackageSchema } from './packages';
import { createProjectSchema } from './projects';
import { createVulnerabilitySchema } from './vulnerabilities';
import { Package, Project, Vuln } from './tablenames';

const dynamoose = DynamooseModule.forFeatureAsync([
  {
    name: Vuln,
    useFactory: () => createVulnerabilitySchema(),
  },
  {
    name: Package,
    inject: ['VulnModel'],
    useFactory: (_, model) => createPackageSchema(model),
  },
  {
    name: Project,
    inject: ['PackageModel'],
    useFactory: (_, model) => createProjectSchema(model),
  },
]);

@Module({
  imports: [dynamoose],
  exports: [dynamoose],
})
export class SchemaModule {}
