import { Injectable } from '@nestjs/common';
import { Package, PackageKey } from '@schemas/packages';
import { Project, ProjectKey } from '@schemas/projects';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ParserService } from '@money-trees/parser/parser.service';
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
    readonly prj: Model<Project, ProjectKey, 'id'>
  ) {
    this.parserSvc = new ParserService(pkg, prj);
  }

  async loadContent(content: string, repoInfo: RepoInfo) {
    return this.parserSvc.parseFileContents(
      content.replace(/npmjs\.org/g, `${process.env.DOMAIN}.org`),
      {
        owner: repoInfo.owner,
        name: repoInfo.repository,
      }
    );
  }
}
