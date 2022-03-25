import { Injectable, NotFoundException } from '@nestjs/common';
import { Vulnerability, VulnerabilityKey } from '@schemas/vulnerabilities';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 as uuid } from 'uuid';
import { PackagesService } from '../packages/packages.service';
import { QueryService } from '../query-service.abstract';
import { CreateVulnInput, UpdateVulnInput } from './vulns.dto';

@Injectable()
export class VulnsService extends QueryService<
  Vulnerability,
  VulnerabilityKey
> {
  constructor(
    @InjectModel('Vuln')
    readonly vulns: Model<Vulnerability, VulnerabilityKey, 'id'>,
    private readonly pkgSvc: PackagesService,
  ) {
    super(vulns);
  }

  async linkToPackage(vulnId: string, packageId: string) {
    const pkg = await this.pkgSvc.findOne(packageId);
    if (!pkg.vulns && !Array.isArray(pkg.vulns)) {
      // First vuln on package
      pkg.vulns = [packageId] as any;
    } else if (!pkg.vulns.find((v: any) => v === vulnId)) {
      // Add new vuln to package
      pkg.vulns.push(packageId as any);
    } else {
      // vuln found in package, no updates
      return;
    }
    return pkg;
  }

  async unlinkFromPackage(vulnId: string, packageId: string) {
    const pkg = await this.pkgSvc.findOne(packageId);
    if (!pkg.vulns && !Array.isArray(pkg.vulns)) {
      // no vulns in package
      return;
    } else if (!pkg.vulns.find((v: any) => v === vulnId)) {
      // specific vuln not in package
      return;
    }
    pkg.vulns = pkg.vulns.filter((v: any) => v !== vulnId);
    return pkg;
  }

  async create(input: CreateVulnInput) {
    const { packageIds, ...data } = input;
    const vulnId = uuid();
    const pkgs = await Promise.all(
      packageIds.map((id) => this.linkToPackage(vulnId, id)).filter((p) => !!p),
    );

    await this.transaction([
      this.vulns.transaction.create(data),
      ...pkgs.map((p) => this.pkgSvc.packages.transaction.update(p)),
    ]);

    return this.vulns.get({ id: vulnId });
  }

  async update(id: string, input: UpdateVulnInput) {
    const exists = await this.vulns.get({ id });
    if (!exists) throw new NotFoundException();
    return this.vulns.update({ id }, input);
  }

  // TODO: 'unlink' or 'cascade delete' on Package model
  async delete(id: string) {
    const toDelete = await this.vulns.get({ id });
    if (!toDelete) throw new NotFoundException();

    await this.transaction([this.vulns.transaction.delete({ id })]);

    return toDelete;
  }
}
