import { Controller } from '@nestjs/common';
import { Project, ProjectKey } from '@schemas/projects';
import { InjectModel, Model } from 'nestjs-dynamoose';

@Controller('project')
export class ProjectController {
  constructor(
    @InjectModel('Project')
    readonly prjModel: Model<Project, ProjectKey>,
  ) {}
}
