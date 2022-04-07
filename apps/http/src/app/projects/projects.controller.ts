import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { PaginationDto, ProjectDetailDto, ProjectDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { ProjectsService } from './projects.service';

class ProjectSearchInputDto extends PartialType(
  IntersectionType(OmitType(ProjectDto, ['id']), PaginationDto)
) {}

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({
    summary: 'All projects',
    description:
      'Query for projects uses the AND operator and you can paginate by supplying at least the lastKey param',
  })
  @ApiOkResponse({
    type: [ProjectDto],
  })
  @UseInterceptors(new DtoConformInterceptor(ProjectDto))
  @Get()
  findAll(
    @Query()
    { limit, lastKey, ...query }: ProjectSearchInputDto
  ): Promise<ProjectDto[]> {
    return this.projectsService.findAll(limit, lastKey, query);
  }

  @ApiOperation({ summary: 'Project with given ID' })
  @ApiOkResponse({
    type: ProjectDto,
  })
  @UseInterceptors(new DtoConformInterceptor(ProjectDto))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectDto> {
    const prj = await this.projectsService.findOne(id);
    return plainToInstance(ProjectDto, prj);
  }

  @ApiOperation({
    summary: 'Project with given ID including its dependencies (packages used)',
  })
  @ApiOkResponse({
    type: ProjectDetailDto,
  })
  @UseInterceptors(new DtoConformInterceptor(ProjectDetailDto))
  @Get(':id/packages')
  async packagesInProject(
    @Param('id') id: string,
    @Query() { lastKey, limit }: PaginationDto
  ): Promise<ProjectDetailDto> {
    return this.projectsService.findOneWithPackages(id, lastKey, limit);
  }
}
