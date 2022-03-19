import { Controller } from '@nestjs/common';
import { QueryController } from '../query-service.abstract';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController extends QueryController {
  constructor(private readonly packagesService: PackagesService) {
    super(packagesService);
  }
}
