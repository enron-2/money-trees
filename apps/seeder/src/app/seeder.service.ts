import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ParserService } from '@money-trees/parser/parser.service';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { MainTableDoc, MainTableKey } from '@schemas/entities/entity';

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
}
