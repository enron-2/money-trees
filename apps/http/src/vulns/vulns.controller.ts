import { Controller } from '@nestjs/common';
import { QueryController } from '../query-service.abstract';
import { VulnsService } from './vulns.service';

@Controller('vulns')
export class VulnsController extends QueryController {
  constructor(private readonly vulnsService: VulnsService) {
    super(vulnsService);
  }
}
