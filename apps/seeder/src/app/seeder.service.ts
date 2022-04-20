import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { chunk } from 'lodash';

/* eslint-disable  @nrwl/nx/enforce-module-boundaries */
import { ParserService } from '@money-trees/parser/parser.service';
import { VulnsService } from '@money-trees/http/vulns/vulns.service';
/* eslint-enable @nrwl/nx/enforce-module-boundaries */

import { MainTableDoc, MainTableKey } from '@schemas/entities/entity';
import { EntityType } from '@schemas/entities';
import { TableName, GSI } from '@constants';

type RepoInfo = {
  owner: string;
  repository: string;
};

@Injectable()
export class SeederService {
  parserSvc: ParserService;
  vulnSvc: VulnsService;

  constructor(
    @InjectModel(TableName)
    readonly model: Model<MainTableDoc, MainTableKey>
  ) {
    this.parserSvc = new ParserService(model);
    this.parserSvc.domain = process.env.DOMAIN;
    this.vulnSvc = new VulnsService(model);
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
        .using(GSI.Type)
        .where('type')
        .eq(EntityType.Vuln);
      Object.entries(meta).forEach(
        ([k, v]) => !!v && query.and().where(k).eq(v)
      );
      const exists = await query.exec();
      if (exists && exists.length > 0) continue;
      await this.vulnSvc.create({
        ...meta,
        packageIds: ['PKG#collection-map#1.0.0'],
      });
    }
  }
}
