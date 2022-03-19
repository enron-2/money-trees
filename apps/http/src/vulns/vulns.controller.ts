import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryController } from '../query-service.abstract';
import { VulnsService } from './vulns.service';

@ApiTags('Vulnerabilities')
@Controller('vulns')
export class VulnsController extends QueryController {
  constructor(private readonly vulnsService: VulnsService) {
    super(vulnsService);
  }
}
