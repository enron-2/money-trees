import { Injectable } from '@nestjs/common';
import { Project, ProjectKey } from '@schemas/projects';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { QueryService } from '../query-service.abstract';

@Injectable()
export class ProjectsService extends QueryService<Project, ProjectKey> {
  constructor(
    @InjectModel('Project')
    readonly projects: Model<Project, ProjectKey, 'id'>,
  ) {
    super(projects);
  }
}
