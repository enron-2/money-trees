import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ParserService } from '@money-trees/parser/parser.service';
import { InjectModel, Model } from 'nestjs-dynamoose';
import {
  PkgVulnDocument,
  PkgVulnDocumentKey,
  PrjDocument,
  PrjDocumentKey,
} from '@schemas/tables';
import * as tablenames from '@schemas/tablenames';

type RepoInfo = {
  owner: string;
  repository: string;
};

type PkgVulnModel = Model<PkgVulnDocument, PkgVulnDocumentKey, 'id' | 'type'>;
type PrjModel = Model<PrjDocument, PrjDocumentKey, 'id' | 'type'>;

@Injectable()
export class SeederService {
  parserSvc: ParserService;
  constructor(
    @InjectModel(tablenames.PackageVuln)
    readonly pkgVln: PkgVulnModel,
    @InjectModel(tablenames.Project)
    readonly prj: PrjModel
  ) {
    this.parserSvc = new ParserService(pkgVln, prj);
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
}
