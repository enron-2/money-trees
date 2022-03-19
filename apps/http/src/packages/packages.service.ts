import { Injectable } from '@nestjs/common';
import { Package, PackageKey } from '@schemas/packages';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { QueryService } from '../query-service.abstract';

@Injectable()
export class PackagesService extends QueryService {
  constructor(
    @InjectModel('Package')
    readonly packages: Model<PackageKey, Package, 'id'>,
  ) {
    super(packages);
  }
}
