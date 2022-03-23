import { Injectable, Logger } from '@nestjs/common';
import { Package, PackageKey } from '@schemas/packages';
import { Project, ProjectKey } from '@schemas/projects';
import { PackageLock } from 'apps/parser/src/package-lock.dto';
import { ParserService } from 'apps/parser/src/parser.service';
import { InjectModel, Model } from 'nestjs-dynamoose';

type RepoInfo = {
  owner: string;
  repository: string;
};

@Injectable()
export class SeederService {
  parserSvc: ParserService;
  constructor(
    @InjectModel('Package')
    readonly pkg: Model<Package, PackageKey, 'id'>,
    @InjectModel('Project')
    readonly prj: Model<Project, ProjectKey, 'id'>,
  ) {
    this.parserSvc = new ParserService(null, null);
  }

  async loadContent(content: string, repoInfo: RepoInfo) {
    const logger = new Logger(SeederService.name);
    let lockFile = await this.parserSvc.createLockFile(content, logger);
    lockFile = this.replaceNpmJsWithDomain(lockFile);
    lockFile = this.parserSvc.removeNodeModulePrefix(lockFile);

    const packages = await Promise.all(
      Array.from(lockFile.packages).map(async ([key, val]) => {
        const [existingPkg] = await this.pkg
          .query()
          .where('checksum')
          .eq(val.integrity)
          .limit(1)
          .exec();
        if (existingPkg) {
          logger.log(`Found existing package: ${existingPkg.name}`);
          return existingPkg;
        }
        logger.log(`Creating package: ${key}`);
        return this.pkg.create({
          name: key,
          version: val.version,
          url: val.resolved,
          checksum: val.integrity,
          createdAt: new Date(),
        });
      }),
    );

    const name = `${repoInfo.owner}/${repoInfo.repository}`;
    const url = `https://github.com/${name}`;
    const [project] = await this.prj
      .query()
      .where('url')
      .eq(url)
      .limit(1)
      .exec();
    if (project) {
      logger.log(`Project found: ${project.name}`);
      const { id, ...data } = project;
      await this.prj.update(
        { id },
        {
          ...data,
          url,
          name,
          packages: packages.map((p) => p.id) as any,
        },
      );
    } else {
      logger.log(`Creating project: ${name}`);
      await this.prj.create({
        url,
        name,
        packages: packages.map((p) => p.id) as any,
      });
    }
  }

  private replaceNpmJsWithDomain(lockFile: PackageLock) {
    const newMap: PackageLock['packages'] = new Map();
    lockFile.packages.forEach((v, k) => {
      const value: typeof v = {
        ...v,
        resolved: v.resolved.replace('npmjs', process.env.DOMAIN),
      };
      newMap.set(k, value);
    });
    lockFile.packages = newMap;
    return lockFile;
  }
}
