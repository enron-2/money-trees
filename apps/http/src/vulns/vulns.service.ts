import { Injectable } from '@nestjs/common';
import { Vulnerability, VulnerabilityKey } from '@schemas/vulnerabilities';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { QueryService } from '../query-service.abstract';

@Injectable()
export class VulnsService extends QueryService<
  Vulnerability,
  VulnerabilityKey
> {
  constructor(
    @InjectModel('Vuln')
    readonly vulns: Model<Vulnerability, VulnerabilityKey>,
  ) {
    super(vulns);
  }
}
