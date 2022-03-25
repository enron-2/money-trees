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
      pkg.vulns = [vulnId] as any;
    } else if (!pkg.vulns.find((v: any) => v === vulnId)) {
      // Add new vuln to package
      pkg.vulns.push(vulnId as any);
    } else {
      // vuln found in package, no updates
      return;
    }
    return pkg;
  }

  async unlinkFromPackage(vulnId: string) {
    const pkgs = await this.pkgSvc.packages
      .scan()
      .where('vulns')
      .contains(vulnId)
      .all()
      .exec();
    return pkgs.map((pkg) => ({
      ...pkg,
      vulns: pkg.vulns.filter((vId: any) => vId !== vulnId),
    }));
  }

  async create(input: CreateVulnInput) {
    const { packageIds, ...data } = input;
    const vulnId = uuid();
    const pkgs = await Promise.all(
      packageIds.map((id) => this.linkToPackage(vulnId, id)),
    ).then((res) => res.filter((p) => !!p));

    // TODO: wrap this section in Transaction
    const newVuln = await this.vulns.create({ id: vulnId, ...data });
    await Promise.all(
      pkgs.map(({ id, ...data }) => this.pkgSvc.packages.update({ id }, data)),
    );

    return newVuln;
  }

  async update(id: string, input: UpdateVulnInput) {
    const exists = await this.vulns.get({ id });
    if (!exists) throw new NotFoundException();
    return this.vulns.update({ id }, input);
  }

  async delete(id: string) {
    const toDelete = await this.vulns.get({ id });
    if (!toDelete) throw new NotFoundException();
    const pkgs = await this.unlinkFromPackage(id);

    // TODO: wrap this section in Transaction
    await Promise.all(
      pkgs.map(({ id, ...data }) => this.pkgSvc.packages.update({ id }, data)),
    );
    await this.vulns.delete({ id });

    return toDelete;
  }
}
