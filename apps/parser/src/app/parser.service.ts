import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { InjectModel, Model, Document } from 'nestjs-dynamoose';
import { Injectable, Logger } from '@nestjs/common';
import { Package, PackageKey } from '@schemas/packages';
import { Project, ProjectKey } from '@schemas/projects';
import { PackageLock } from './package-lock.dto';

type RepoMeta = { owner: string; name: string };

@Injectable()
export class ParserService {
  constructor(
    @InjectModel('Package')
    readonly pkg: Model<Package, PackageKey, 'id'>,
    @InjectModel('Project')
    readonly prj: Model<Project, ProjectKey, 'id'>,
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
        `Cannot process content: ${error?.toString() || 'Unknown'}`,
      );
    }

    return lockFile;
  }

  async parseFileContents(content: string, repository: RepoMeta) {
    const logger = new Logger(`${repository.owner}/${repository.name}`);
    let lockFile: PackageLock;
    try {
      lockFile = await this.createLockFile(content, logger);
    } catch (error: any) {
      logger.error(`Cannot process content: ${error?.toString() || 'Unknown'}`);
      return;
    }

    const domain = process.env.DOMAIN;
    if (domain) logger.log(`Filter for domain: ${domain}`);
    else logger.log('No domain provided, check ALL dependencies');

    const pattern = new RegExp(`http.*${domain}.*/.*`);

    // BUG: may violate package checksum unique constraint
    // If multiple lambdas spawn at the same time, all of them may create its
    // own 'instance' of the package with the same checksum
    // fix: use another dynamodb table as 'lock' primitives

    lockFile = this.removeNodeModulePrefix(lockFile);
    const packages = await Promise.all(
      Array.from(lockFile.packages)
        // Save only package matching domain, only if domain is defined
        .filter(([, pkg]) => !domain || pattern.test(pkg.resolved))
        .map(async ([name, pkg]) => {
          const packagesFound: Document<Package>[] = await this.pkg
            .query()
            .where('checksum')
            .eq(pkg.integrity.trim())
            .exec();

          if (packagesFound.length > 1) {
            logger.error(`Checksum collision: ${name}@${pkg.version}`);
          }

          const packageFound = packagesFound[0];

          if (packageFound) {
            logger.log(`Found package in database: ${packageFound.name}`);
            return packageFound.id;
          }

          const pkgIdentifier = `${name}@${pkg.version}`;
          logger.log(`Creating ${pkgIdentifier}`);
          const savedPkg: Document<Package> = await this.pkg.create({
            name: name.trim(),
            checksum: pkg.integrity.trim(),
            url: pkg.resolved.trim(),
            version: pkg.version.trim(),
            createdAt: new Date(),
          });
          logger.log(`Created ${pkgIdentifier}`);

          return savedPkg.id;
        }),
    );
    logger.log(`Processed ${packages?.length || 0} packages`);

    // TODO: find other ways beside harcoding github
    const name = `${repository.owner}/${repository.name}`;
    const url = `https://github.com/${name}`;

    const [project] = await this.prj.query().where('url').eq(url).exec();

    if (project) {
      const { id, ...data } = project;
      await this.prj.update(
        { id },
        {
          ...data,
          url,
          packages: packages as any,
          name,
        },
      );
    } else {
      await this.prj.create({
        url,
        packages: packages as any,
        name,
      });
    }

    if (project) logger.log('Updated existing project');
    else logger.log('New project with dependencies created');

    return project
      ? `Updated project ${name}, ${packages.length} updated`
      : `Created project ${name}, ${packages.length} added`;
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
