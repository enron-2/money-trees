import { Controller } from '@nestjs/common';
import { QueryController } from '../query-service.abstract';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController extends QueryController {
  constructor(private readonly projectsService: ProjectsService) {
    super(projectsService);
  }
}
