import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { InjectModel, Model, Document } from 'nestjs-dynamoose';
import { Injectable, Logger } from '@nestjs/common';
import { SortOrder } from 'dynamoose/dist/General';
import { chunk } from 'lodash';
import {
  PkgVulnDocument,
  PkgVulnDocumentKey,
  PrjDocument,
  PrjDocumentKey,
} from '@schemas/tables';
import { PackageVuln, Project } from '@schemas/tablenames';
import { PackageEntity, ProjectEntity } from '@schemas/entities';
import { normalizeAttributes } from '@core/utils';
import { PackageLock, PkgMeta } from './package-lock.dto';

type RepoMeta = { owner: string; name: string };
type PkgVulnModel = Model<PkgVulnDocument, PkgVulnDocumentKey, 'id' | 'type'>;
type PrjModel = Model<PrjDocument, PrjDocumentKey, 'id' | 'type'>;

@Injectable()
export class ParserService {
  domain: string;

  constructor(
    @InjectModel(PackageVuln)
    readonly pkgVuln: PkgVulnModel,
    @InjectModel(Project)
    readonly prj: PrjModel
  ) {}

  async createLockFile(rawFileContents: string, logger?: Logger) {
    let lockFile: PackageLock;

    try {
      logger?.log('Parsing content');
      lockFile = plainToClass(PackageLock, JSON.parse(rawFileContents));
      logger?.log('Content parsed');

      lockFile?.packages?.delete('');

      logger?.log('Validating content');
      await validateOrReject(lockFile);
      logger?.log('Content validated');
    } catch (error: any) {
      throw new Error(
        `Cannot process content: ${error?.toString() || 'Unknown'}`
      );
    }

    return lockFile;
  }

  async saveFileContents(lockFile: PackageLock, repo: RepoMeta) {
    const logger = new Logger(`${repo.owner}/${repo.name}`);
    const newLockFile = this.removeNodeModulePrefix(lockFile);
    const pkgs = await Promise.all(
      this.filterPackagesByDomain(newLockFile.packages).map(
        async ([name, pkg]) => {
          const pkgFound = await this.getPackage(name, pkg.version);
          if (pkgFound) {
            logger.log(`Found package ${name} in database`);
            return pkgFound;
          }
          const newPkg = await this.createPackage(name, pkg);
          logger.log(`Created package ${name}`);
          return newPkg;
        }
      )
    );
    logger.log(`Processed ${pkgs.length ?? 0} packages`);

    const prjName = `${repo.owner}/${repo.name}`;
    const url = `https://github.com/${prjName}`;
    const prjFound = await this.getProject(`PRJ#${prjName}`);
    if (prjFound) {
      logger.log(`Deleting project ${prjFound.name}`);
      await this.deleteProject(prjFound.id);
    }
    const prjCreated = await this.createProject(
      prjName,
      url,
      pkgs.map((p) => p.id)
    );
    logger.log(`Created project ${prjCreated.name}`);
    return `Project: ${prjCreated.name}, with ${pkgs.length} packages`;
  }

  filterPackagesByDomain(pkgs: PackageLock['packages']) {
    const pattern = new RegExp(`http.*${this.domain}.*/.*`);
    return Array.from(pkgs).filter(
      ([, pkg]) => !this.domain || pattern.test(pkg.resolved)
    );
  }

  async getPackage(
    name: string,
    version: string
  ): Promise<undefined | Document<PkgVulnDocument>> {
    const key = `PKG#${name}#${version}`;
    try {
      return this.pkgVuln.get(
        { id: key, type: key },
        { return: 'document', attributes: normalizeAttributes(PackageEntity) }
      );
    } catch (err: unknown) {
      return;
    }
  }

  async getProject(prjId: string): Promise<undefined | Document<PrjDocument>> {
    try {
      return this.prj.get(
        { id: prjId, type: prjId },
        { return: 'document', attributes: normalizeAttributes(ProjectEntity) }
      );
    } catch (err: unknown) {
      return;
    }
  }

  createPackage(name: string, pkg: PkgMeta) {
    const key = `PKG#${name}#${pkg.version}`;
    return this.pkgVuln.create({
      id: key,
      type: key,
      name,
      version: pkg.version,
      url: pkg.resolved,
      checksum: pkg.integrity,
    });
  }

  async createProject(name: string, url: string, pkgIds: string[]) {
    const partitionKey = `PRJ#${name}`;
    const project = await this.prj.create({
      id: partitionKey,
      type: partitionKey,
      url,
      name,
    });
    await Promise.all(
      pkgIds.map((pkgId) =>
        this.prj.create({
          id: partitionKey,
          type: pkgId,
        })
      )
    );
    return project;
  }

  async deleteProject(prjId: string) {
    const pkgs = await this.prj
      .query('id')
      .eq(prjId)
      .all(100)
      .sort(SortOrder.descending)
      .exec();
    let deletions = await Promise.all(
      chunk(pkgs, 25).map((packages) => this.prj.batchDelete(packages))
    );
    while (deletions.length < 0) {
      deletions = await Promise.all(
        chunk(deletions.map((d) => d.unprocessedItems).flat(), 25).map(
          (packages) => this.prj.batchDelete(packages)
        )
      );
    }
  }

  /** Filter out things prefixed with node_modules */
  removeNodeModulePrefix(input: PackageLock) {
    const newMap: PackageLock['packages'] = new Map();
    input.packages.forEach((v, k) => {
      if (!k.startsWith('node_modules/')) newMap.set(k, v);
    });
    input.packages = newMap;
    return input;
  }
}
