import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Injectable, Logger } from '@nestjs/common';
import { chunk } from 'lodash';
import { PackageEntity, ProjectEntity } from '@schemas/entities';
import { PackageLock, PkgMeta } from './package-lock.dto';
import { MainTableDoc, MainTableKey } from '@schemas/entities/entity';
import { EntityType } from '@schemas/entities/enums';

type RepoMeta = { owner: string; name: string };

@Injectable()
export class ParserService {
  domain: string;

  constructor(
    @InjectModel('MainTable')
    readonly model: Model<MainTableDoc, MainTableKey>
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
  ): Promise<undefined | PackageEntity> {
    const key = `PKG#${name}#${version}`;
    try {
      const pkg = await this.model.get({ pk: key, sk: key });
      return PackageEntity.fromDocument(pkg);
    } catch (err: unknown) {
      return;
    }
  }

  async getProject(prjId: string): Promise<undefined | ProjectEntity> {
    try {
      const prj = await this.model.get({
        pk: prjId,
        sk: prjId,
      });
      return ProjectEntity.fromDocument(prj);
    } catch (err: unknown) {
      return;
    }
  }

  async createPackage(name: string, pkg: PkgMeta) {
    const key = `PKG#${name}#${pkg.version}`;
    const pkgEntity = await this.model.create({
      pk: key,
      sk: key,
      type: EntityType.Package,
      name,
      version: pkg.version,
      url: pkg.resolved,
      checksum: pkg.integrity,
    });
    return PackageEntity.fromDocument(pkgEntity);
  }

  async createProject(name: string, url: string, pkgIds: string[]) {
    const key = `PRJ#${name}`;
    const project = await this.model.create({
      pk: key,
      sk: key,
      type: EntityType.Project,
      url,
      name,
    });
    await Promise.all(
      pkgIds.map((pkgId) =>
        this.model.create({
          pk: key,
          sk: pkgId,
        })
      )
    );
    return ProjectEntity.fromDocument(project);
  }

  async deleteProject(prjId: string) {
    const prjEntries = await this.model
      .query('pk')
      .eq(prjId)
      .all(100)
      .attributes(['pk', 'sk'])
      .exec();
    let deletions = await Promise.all(
      chunk(prjEntries, 25).map((entries) =>
        this.model.batchDelete(
          entries.map((e) => ({
            pk: e.pk,
            sk: e.sk,
          }))
        )
      )
    );
    while (deletions.length < 0) {
      deletions = await Promise.all(
        chunk(deletions.map((d) => d.unprocessedItems).flat(), 25).map((e) =>
          this.model.batchDelete(e)
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
