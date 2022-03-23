import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectDetailDto, ProjectDto } from '../dto';
import { PaginationDto } from '../query-service.abstract';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOkResponse({
    type: [ProjectDto],
  })
  @Get()
  findAll(
    @Query()
    { limit, lastKey }: PaginationDto,
  ): Promise<ProjectDto[]> {
    return this.projectsService.findAll(limit, lastKey);
  }

  @ApiOkResponse({
    type: ProjectDto,
  })
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProjectDto> {
    const res = await this.projectsService.findOne(id);
    if (!res) throw new NotFoundException();
    return res;
  }

  // TODO: handle pagination of packages?
  @ApiOkResponse({
    type: ProjectDetailDto,
  })
  @Get(':id/packages')
  async packagesInProject(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProjectDetailDto> {
    const response = await this.projectsService.findOne(id);
    if (!response) throw new NotFoundException();
    await response.populate();
    return response;
  }
}
