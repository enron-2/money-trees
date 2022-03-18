import { Controller } from '@nestjs/common';
import { Vulnerability, VulnerabilityKey } from '@schemas/vulnerabilities';
import { InjectModel, Model } from 'nestjs-dynamoose';

@Controller('vuln')
export class VulnController {
  constructor(
    @InjectModel('Vuln')
    readonly vulnModel: Model<Vulnerability, VulnerabilityKey>,
  ) {}
}
