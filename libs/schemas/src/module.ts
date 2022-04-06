import { Module } from '@nestjs/common';
import { CustomDynamooseModule } from '@core/customDynamoose';
import { PkgVulnSchema, PrjSchema } from './tables';
import { PackageVuln, Project } from './tablenames';

const customDynamooseModule = CustomDynamooseModule.forFeatureAsync([
  {
    name: process.env.PKG_VLN_TABLE ?? PackageVuln,
    useFactory: () => PkgVulnSchema,
    provide: PackageVuln,
  },
  {
    name: process.env.PRJ_TABLE ?? Project,
    useFactory: () => PrjSchema,
    provide: Project,
  },
]);

@Module({
  imports: [customDynamooseModule],
  exports: [customDynamooseModule],
})
export class SchemaModule {}
