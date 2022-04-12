import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ParserService } from '@money-trees/parser/parser.service';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { MainTableDoc, MainTableKey } from '@schemas/entities/entity';
import { EntityType, VulnEntity } from '@schemas/entities';

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
      const ulidVal = ulid();
      const { id, ...vln } = VulnEntity.fromDocument({
        ...meta,
        type: EntityType.Vuln,
        ulid: ulidVal,
      }).toPlain();
      await this.model.create({
        pk: id,
        sk: id,
        ...vln,
        ulid: ulidVal,
        type: EntityType.Vuln,
      });
      await this.model.create({
        pk: 'PKG#chalk#2.4.2',
        sk: id,
      });
    }
  }
}
