import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectKey, Project } from '@schemas/projects';
import { Vulnerability, VulnerabilityKey } from '@schemas/vulnerabilities';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 } from 'uuid';
import { ProjectDto } from '../dto';
import { PackagesService } from '../packages/packages.service';
import { QueryService } from '../query-service.abstract';
import { CreateVulnInput, UpdateVulnInput } from './vulns.dto';

// nx generatePackageJson does not pickup uuid when using import aliasing
const uuid = v4;

@Injectable()
export class VulnsService extends QueryService<
  Vulnerability,
  VulnerabilityKey
> {
  constructor(
    @InjectModel('Vuln')
    readonly vulns: Model<Vulnerability, VulnerabilityKey, 'id'>,
    private readonly pkgSvc: PackagesService,
    @InjectModel('Project')
    private readonly projects: Model<Project, ProjectKey, 'id'>
  ) {
    super(vulns);
  }

  /**
   * Get list of packages affected by the vuln
   */
  async packagesAffected(id: string, limit = 10, lastKey?: string) {
    const vuln = await this.vulns.get(
      { id },
      { attributes: ['id'], return: 'document' }
    );
    if (!vuln) throw new NotFoundException();
    const scanner = this.pkgSvc.packages
      .scan()
      .where('vulns')
      .contains(vuln.id);
    if (lastKey) scanner.startAt({ id: lastKey });
    return scanner.exec().then((res) => res.slice(0, limit));
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
      packageIds.map((id) => this.linkToPackage(vulnId, id))
    ).then((res) => res.filter((p) => !!p));

    const scanner = this.projects
      .scan()
      .attributes([...this.normalizeAttributes(ProjectDto as any), 'maxVuln']);
    packageIds?.forEach((pkgId) =>
      scanner.or().where('packages').contains(pkgId)
    );
    // Find projects that uses the package
    const scanResults = await scanner.exec();

    // Resolve 'maxVuln' property from id
    const projectsAffected = await Promise.all(
      scanResults.map(async (prj) => ({
        ...prj,
        maxVuln: prj.maxVuln
          ? await this.vulns
              .query()
              .where('id')
              .eq(prj.maxVuln)
              .exec()
              .then((res) => res[0])
          : undefined,
      }))
    );

    const newVuln = this.vulns.transaction.create({ id: vulnId, ...data });

    // Populate maxVuln for all packages
    const populatedPkgs = await Promise.all(
      pkgs.map(async (pkg) => ({
        ...pkg,
        maxVuln: pkg.maxVuln
          ? await this.vulns
              .query()
              .where('id')
              .eq(pkg.maxVuln)
              .exec()
              .then((res) => res[0])
          : undefined,
      }))
    );

    // Prepare update package transaction
    const updatedPkgs = populatedPkgs
      .filter((pkg) => !pkg.maxVuln || pkg.maxVuln.severity < data.severity)
      .map(({ id, ...pkgUpdateData }) =>
        this.pkgSvc.packages.transaction.update(
          { id },
          {
            ...pkgUpdateData,
            maxVuln: { ...data, id: vulnId },
          }
        )
      );

    // Prepare update project transaction
    const updatedProjects = projectsAffected
      .filter((prj) => !prj.maxVuln || prj.maxVuln.severity < data.severity)
      .map(({ id, ...prjUpdateData }) =>
        this.projects.transaction.update(
          { id },
          { ...prjUpdateData, maxVuln: { ...data, id: vulnId } }
        )
      );

    await this.transaction([newVuln, ...updatedPkgs, ...updatedProjects]);

    return this.vulns.get({ id: vulnId });
  }

  /**
   * Update a Vulnerability
   * Does not change package association
   */
  async update(id: string, input: UpdateVulnInput) {
    const exists = await this.vulns.get({ id });
    if (!exists) throw new NotFoundException();
    const newData = plainToInstance(
      UpdateVulnInput,
      {
        ...exists,
        ...instanceToPlain(input, { exposeUnsetFields: false }),
      },
      {
        excludeExtraneousValues: true,
      }
    );
    // TODO: update projects and packages if severity changes
    return this.vulns.update({ id }, newData);
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

    await pkg.populate();
    const { id, ...data } = pkg;

    const affectedProjects = await this.projects
      .scan()
      .where('packages')
      .contains(pkg.id)
      .exec();

    const updatedPackages = this.pkgSvc.packages.transaction.update(
      { id },
      {
        ...data,
        maxVuln:
          data?.maxVuln?.severity ?? -1 > vuln.severity ? data.maxVuln : vuln,
      }
    );
    const updatedProjects = affectedProjects
      .filter((prj) => prj?.maxVuln?.severity ?? -1 < vuln.severity)
      .map(({ id, ...data }) =>
        this.projects.transaction.update({ id }, { ...data, maxVuln: vuln })
      );

    await this.transaction([updatedPackages, ...updatedProjects]);

    return this.pkgSvc.findOne(pkg.id);
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
    await pkg.populate();

    const projects = await this.projects.scan().exec();
    await Promise.all(projects.map((prj) => prj.populate()));
    const projectsAffected = projects
      .filter((prj) => prj.maxVuln && prj.maxVuln.id === vuln.id)
      .map(({ id, ...prjUpdateData }) =>
        this.projects.transaction.update(
          { id },
          {
            ...prjUpdateData,
            maxVuln: prjUpdateData.packages?.reduce((prev, curr) =>
              prev.maxVuln?.severity > curr.maxVuln?.severity ? prev : curr
            ).maxVuln,
          }
        )
      );

    const { id, ...data } = pkg;
    const updated = await this.pkgSvc.packages.transaction.update(
      { id },
      {
        ...data,
        // get new maxVuln
        maxVuln: data.vulns?.reduce((prev, curr) =>
          prev.severity > curr.severity ? prev : curr
        ),
      }
    );

    await this.transaction([updated, ...projectsAffected]);

    return this.pkgSvc.findOne(pkg.id).then((pkg) => pkg.populate());
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

    const scanner = this.projects
      .scan()
      .attributes(['id', 'name', 'url', 'packages', 'maxVuln'] as Array<
        keyof Project
      >);
    for (const pkg of pkgs) {
      scanner.or().where('packages').contains(pkg.id);
    }

    const scanResults = await scanner.exec();
    const affectedProjects = await Promise.all(
      scanResults.map((s) => s.populate())
    );

    const updatedPrjs = affectedProjects
      .filter((prj) => prj.maxVuln?.id === toDelete.id)
      .map(({ id, ...updatedPrjData }) => {
        const newMaxVuln = updatedPrjData.packages
          ?.map((p) =>
            p?.vulns
              ?.filter((v) => v.id !== toDelete.id)
              ?.reduce(
                (prev, curr) =>
                  prev?.severity ?? -1 > curr?.severity ?? -1 ? prev : curr,
                undefined
              )
          )
          ?.reduce((prev, curr) =>
            prev?.severity ?? -1 > curr?.severity ?? -1 ? prev : curr
          );

        return this.projects.transaction.update(
          { id },
          {
            ...updatedPrjData,
            packages: updatedPrjData.packages.map((pkg) => pkg.id) as any,
            maxVuln: newMaxVuln,
          }
        );
      });

    const deletedVuln = this.vulns.transaction.delete({ id });
    const updatedPkgs = pkgs.map(({ id, ...data }) =>
      this.pkgSvc.packages.transaction.update(
        { id },
        {
          ...data,
          maxVuln: data.vulns?.reduce(
            (prev, curr) =>
              prev?.severity ?? -1 > curr?.severity ?? -1 ? prev : curr,
            data.vulns?.[0]
          ),
        }
      )
    );
    await this.transaction([...updatedPkgs, ...updatedPrjs, deletedVuln]);

    return toDelete;
  }
}
