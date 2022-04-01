import { Module } from '@nestjs/common';
import { CustomDynamooseModule } from '@core/customDynamoose';
import { createPackageSchema } from './packages';
import { createProjectSchema } from './projects';
import { createVulnerabilitySchema } from './vulnerabilities';
import { Package, Project, Vuln } from './tablenames';

const customDynamooseModule = CustomDynamooseModule.forFeatureAsync([
  {
    name: process.env.VULN_TABLE ?? Vuln,
    provide: Vuln,
    useFactory: () => createVulnerabilitySchema(),
  },
  {
    name: process.env.PACKAGE_TABLE ?? Package,
    provide: Package,
    inject: [`${Vuln}Model`],
    useFactory: (_, model) => createPackageSchema(model),
  },
  {
    name: process.env.PROJECT_TABLE ?? Project,
    provide: Project,
    inject: [`${Package}Model`],
    useFactory: (_, model) => createProjectSchema(model),
  },
]);

@Module({
  imports: [customDynamooseModule],
  exports: [customDynamooseModule],
})
export class SchemaModule {}
