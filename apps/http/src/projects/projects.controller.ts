import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { ProjectDetailDto, ProjectDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { PaginationDto } from '../query-service.abstract';
import { ProjectsService } from './projects.service';

class ProjectSearchInputDto extends PartialType(
  IntersectionType(OmitType(ProjectDto, ['id']), PaginationDto),
) {}

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOkResponse({
    type: [ProjectDto],
  })
  @UseInterceptors(new DtoConformInterceptor(ProjectDto))
  @Get()
  findAll(
    @Query()
    { limit, lastKey, ...query }: ProjectSearchInputDto,
  ): Promise<ProjectDto[]> {
    return this.projectsService.findAll(limit, lastKey, query);
  }

  @ApiOkResponse({
    type: ProjectDto,
  })
  @UseInterceptors(new DtoConformInterceptor(ProjectDto))
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
  @UseInterceptors(new DtoConformInterceptor(ProjectDetailDto))
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
