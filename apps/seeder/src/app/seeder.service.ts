import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ulid } from 'ulid';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ParserService } from '@money-trees/parser/parser.service';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { MainTableDoc, MainTableKey } from '@schemas/entities/entity';
import { EntityType, VulnEntity } from '@schemas/entities';
import { chunk } from 'lodash';

type RepoInfo = {
  owner: string;
  repository: string;
};

@Injectable()
export class SeederService {
  parserSvc: ParserService;
  constructor(
    @InjectModel('MainTable')
    readonly model: Model<MainTableDoc, MainTableKey>
  ) {
    this.parserSvc = new ParserService(model);
    this.parserSvc.domain = process.env.DOMAIN;
  }

  async loadContent(content: string, repoInfo: RepoInfo) {
    const lockFile = await this.parserSvc.createLockFile(
      content.replace(/npmjs\.org/g, `${process.env.DOMAIN}.org`)
    );
    lockFile.packages = new Map(
      chunk(Array.from(lockFile.packages.entries()), 10).map((e) => e[0])
    );
    return this.parserSvc.saveFileContents(lockFile, {
      owner: repoInfo.owner,
      name: repoInfo.repository,
    });
  }

  async loadDefaultVulns() {
    const metadatas = [
      { severity: 1, name: 'CVE-OH-NO' },
      { severity: 3, name: 'CVE-YIKES' },
      { severity: 2, name: 'CVE-DAMN' },
      { severity: 7, name: 'CVE-RED', description: 'Red ?' },
      { severity: 5, name: 'CVE-GREEN', description: 'Green ?' },
      { severity: 8, name: 'CVE-BLUE', description: 'Blue ?' },
    ];
    for (const meta of metadatas) {
      const query = this.model
        .query()
        .using('TypeGSI')
        .where('type')
        .eq(EntityType.Vuln);
      Object.entries(meta).forEach(
        ([k, v]) => !!v && query.and().where(k).eq(v)
      );
      const exists = await query.exec();
      if (exists && exists.length > 0) continue;
      await this.create({ ...meta, packageIds: ['PKG#collection-map#1.0.0'] });
    }
  }

  async create({
    packageIds,
    ...vulnCreate
  }: {
    name: string;
    description?: string;
    severity: number;
    packageIds: string[];
  }) {
    let vulnEntity = VulnEntity.fromDocument({
      ...vulnCreate,
      ulid: ulid(),
      type: EntityType.Vuln,
    });

    const vuln = await this.model.create({
      ...vulnEntity.keys(),
      ...vulnCreate,
      ulid: vulnEntity.ulid,
      type: EntityType.Vuln,
    });

    vulnEntity = VulnEntity.fromDocument(vuln);

    const resolvedPkgs = await this.model.batchGet(
      packageIds.map((id) => ({ pk: id, sk: id }))
    );

    for (const id of packageIds) {
      const found = resolvedPkgs.find((pkg) => pkg.pk === id);
      if (!found) throw new NotFoundException(`Package ID: ${id} not found`);
    }

    const { unprocessedItems } = await this.model.batchPut(
      resolvedPkgs.map((pkg) => ({ pk: pkg.pk, sk: vulnEntity.sk }))
    );
    if (unprocessedItems.length > 0) {
      throw new InternalServerErrorException(
        `Unprocessed items:\n${unprocessedItems}`
      );
    }

    const queryGen = (pk: string) =>
      this.model
        .query()
        .using('InverseGSI')
        .where('sk')
        .eq(pk)
        .and()
        .where('name')
        .not()
        .exists()
        .attributes(['pk'])
        .exec();
    const queryResults = await Promise.all(
      resolvedPkgs.map((p) => queryGen(p.pk))
    );

    const affectedProjects = await this.model.batchGet(
      [...new Set(queryResults.flat().map((prj) => prj.pk))].map((prj) => ({
        pk: prj,
        sk: prj,
      }))
    );
    await Promise.all(
      affectedProjects
        .filter(
          (prj) =>
            !prj.worstVuln || prj.worstVuln.severity < vulnEntity.severity
        )
        .map((prj) =>
          this.model.update(
            { pk: prj.pk, sk: prj.sk },
            {
              $SET: {
                worstVuln: {
                  severity: vulnEntity.severity,
                  id: vulnEntity.id,
                },
              },
            }
          )
        )
    );

    return vulnEntity;
  }
}
