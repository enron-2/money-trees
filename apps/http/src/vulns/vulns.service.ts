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

  /**
   * Get list of packages affected by the vuln
   */
  async packagesAffected(id: string, limit = 10, lastKey?: string) {
    const vuln = await this.vulns.get({ id });
    if (!vuln) throw new NotFoundException();
    const scanner = this.pkgSvc.packages
      .scan()
      .where('vulns')
      .contains(vuln.id)
      .limit(limit);
    if (!!lastKey) scanner.startAt({ id: lastKey });
    return scanner.exec();
  }

  /**
   * Prepare linking a package to a vuln
   * Updates Package.vulns array
   * Does not run any mutation operations
   */
  private async linkToPackage(vulnId: string, packageId: string) {
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

  /**
   * Prepare unlinking a package from a vuln
   * Updates Package.vulns array
   * Does not run any mutation operations
   */
  private async unlinkFromPackage(vulnId: string) {
    // Get all packages containing vulnId
    const pkgs = await this.pkgSvc.packages
      .scan()
      .where('vulns')
      .contains(vulnId)
      .all()
      .exec();
    return pkgs.map((pkg) => ({
      ...pkg,
      // Remove vulnId from vulns
      vulns: pkg.vulns.filter((vId: any) => vId !== vulnId),
    }));
  }

  /**
   * Create new vulnerability
   * Also associate given packageIds to the new vulnerability
   */
  async create(input: CreateVulnInput) {
    const { packageIds, ...data } = input;
    const vulnId = uuid();
    const pkgs = await Promise.all(
      packageIds.map((id) => this.linkToPackage(vulnId, id)),
    ).then((res) => res.filter((p) => !!p));

    const newVuln = this.vulns.transaction.create({ id: vulnId, ...data });
    const updatedPkgs = pkgs.map(({ id, ...data }) =>
      this.pkgSvc.packages.transaction.update({ id }, data),
    );
    await this.transaction([newVuln, ...updatedPkgs]);

    return this.vulns.get({ id: vulnId });
  }

  /**
   * Update a Vulnerability
   * Does not change package association
   */
  async update(id: string, input: UpdateVulnInput) {
    const exists = await this.vulns.get({ id });
    if (!exists) throw new NotFoundException();
    return this.vulns.update({ id }, { ...exists, ...input });
  }

  /**
   * Link a Vulnerability to a Package
   * @returns populated package
   */
  async includePackage(vulnId: string, packageId: string) {
    const [vuln, pkg] = await this.resolveEntities(vulnId, packageId);
    if (!Array.isArray(pkg.vulns)) {
      // Initialise array
      pkg.vulns = [vuln.id] as any;
    } else if (!pkg.vulns.find((vId: any) => vId === vuln.id)) {
      // Push if it does not exist
      pkg.vulns.push(vuln.id as any);
    } else {
      // Vuln already here
      return pkg.populate();
    }
    const { id, ...data } = pkg;
    const updated = await this.pkgSvc.packages.update({ id }, data);
    return updated.populate();
  }

  /**
   * Unlink a Vulnerability from a Package
   * Does not delete it
   * @returns populated package
   */
  async excludePackage(vulnId: string, packageId: string) {
    const [vuln, pkg] = await this.resolveEntities(vulnId, packageId);
    if (!Array.isArray(pkg.vulns)) {
      // No vuln array so no need to remove
      return pkg.populate();
    }
    // Get only vulns with id != vulnId
    pkg.vulns = pkg.vulns.filter((v: any) => v !== vuln.id);
    const { id, ...data } = pkg;
    const updated = await this.pkgSvc.packages.update({ id }, data);
    return updated.populate();
  }

  /**
   * Resolve ids into their entities
   * Throws not found when at least 1 of the id is invalid
   */
  private async resolveEntities(vulnId: string, packageId: string) {
    const vuln = await this.vulns.get({ id: vulnId });
    if (!vuln) throw new NotFoundException('VulnId not found');

    const pkg = await this.pkgSvc.findOne(packageId);
    if (!pkg) throw new NotFoundException('PackageId not found');

    return [vuln, pkg] as const;
  }

  /**
   * Delete vuln from database
   * Updates all packages affected (unlinking)
   */
  async delete(id: string) {
    const toDelete = await this.vulns.get({ id });
    if (!toDelete) throw new NotFoundException();
    const pkgs = await this.unlinkFromPackage(id);

    const deletedVuln = this.vulns.transaction.delete({ id });
    const updatedPkgs = pkgs.map(({ id, ...data }) =>
      this.pkgSvc.packages.transaction.update({ id }, data),
    );
    await this.transaction([...updatedPkgs, deletedVuln]);

    return toDelete;
  }
}
