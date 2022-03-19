import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryController } from '../query-service.abstract';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController extends QueryController {
  constructor(private readonly projectsService: ProjectsService) {
    super(projectsService);
  }

  // TODO: handle pagination of packages?
  @Get(':id/packages')
  async packagesInProject(@Param('id', new ParseUUIDPipe()) id: string) {
    const response = await this.projectsService.findOne(id);
    if (!response) throw new NotFoundException();
    await response.populate();
    return response;
  }
}
