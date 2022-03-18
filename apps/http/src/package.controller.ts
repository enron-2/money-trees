import { Controller } from '@nestjs/common';
import { Package, PackageKey } from '@schemas/packages';
import { InjectModel, Model } from 'nestjs-dynamoose';

@Controller('package')
export class PackageController {
  constructor(
    @InjectModel('Package')
    readonly pkgModel: Model<Package, PackageKey>,
  ) {}
}
