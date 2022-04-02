import { Injectable, NotFoundException } from '@nestjs/common';
import { Package, PackageKey } from '@schemas/packages';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { ProjectDto } from '../dto';
import { ProjectsService } from '../projects/projects.service';
import { QueryService } from '../query-service.abstract';

@Injectable()
export class PackagesService extends QueryService<Package, PackageKey> {
  constructor(
    @InjectModel('Package')
    readonly packages: Model<Package, PackageKey, 'id'>,
    readonly projectSvc: ProjectsService
  ) {
    super(packages);
  }

  async findProjectConsumingPackage(
    packageId: string,
    limit = 10,
    lastKey?: string
  ) {
    const { id } = (await super.findOne(packageId, ['id'])) || {};
    if (!id) throw new NotFoundException();
    const scanner = this.projectSvc.projects
      .scan()
      .where('packages')
      .contains(packageId)
      .attributes(this.projectSvc.normalizeAttributes(ProjectDto));

    if (lastKey) scanner.startAt({ id: lastKey });
    return scanner.exec().then((res) => res.slice(0, limit));
  }
}
