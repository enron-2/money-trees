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
  ApiOperation,
  ApiProperty,
  ApiTags,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PackageWithMaxVuln, ProjectDetailDto, ProjectDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { PaginationDto } from '../query-service.abstract';
import { ProjectsService } from './projects.service';

class ProjectPackageWithMaxVulnDto extends ProjectDto {
  @Expose()
  @Type(() => PackageWithMaxVuln)
  @ApiProperty({ type: [PackageWithMaxVuln] })
  packages: Array<PackageWithMaxVuln>;
}

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
    return this.projectsService.findAll(limit, lastKey, query, ProjectDto);
  }

  @ApiOperation({ summary: 'Project with given ID' })
  @ApiOkResponse({
    type: ProjectDto,
  })
  @UseInterceptors(new DtoConformInterceptor(ProjectDto))
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<ProjectDto> {
    const res = await this.projectsService.findOne(id, ProjectDto);
    if (!res) throw new NotFoundException();
    return res;
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() { lastKey, limit = 10 }: PaginationDto
  ): Promise<ProjectDetailDto> {
    const response = await this.projectsService.findOne(id, ProjectDetailDto);
    if (!response) throw new NotFoundException();

    const pkgIds = response.packages as unknown as string[];
    let lastKeyIdx: number;
    if (lastKey) {
      lastKeyIdx = pkgIds.indexOf(lastKey);
      if (lastKeyIdx < 0) throw new NotFoundException('lastKey not found');
      response.packages =
        response.packages?.length - 1 > lastKeyIdx
          ? response.packages.slice(lastKeyIdx + 1, lastKeyIdx + limit)
          : []; // no more items after lastKey
    } else {
      response.packages = response.packages?.slice(0, limit);
    }

    await response.populate();
    return response;
  }

  @ApiOperation({
    summary:
      'Project with given ID including its dependencies (packages used) + max vulnerability',
  })
  @ApiOkResponse({
    type: ProjectPackageWithMaxVulnDto,
  })
  @UseInterceptors(new DtoConformInterceptor(ProjectPackageWithMaxVulnDto))
  @Get(':id/packages/maxVuln')
  async packagesInProjectWithMaxVuln(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() { lastKey, limit = 10 }: PaginationDto
  ): Promise<ProjectPackageWithMaxVulnDto> {
    const response = await this.projectsService.findOne(id, ProjectDetailDto);
    if (!response) throw new NotFoundException();

    let lastKeyIdx: number;
    if (lastKey) {
      lastKeyIdx = response.packages?.findIndex(
        (p) => (p as unknown as string) === lastKey
      );
      if (lastKeyIdx < 0) throw new NotFoundException('lastKey not found');
      response.packages =
        response.packages.length - 1 > lastKeyIdx
          ? response.packages?.slice(lastKeyIdx + 1, lastKeyIdx + limit)
          : []; // no more items after lastKey
    } else {
      response.packages = response.packages?.slice(0, limit);
    }

    await response.populate();

    const pkgWithMaxVuln: PackageWithMaxVuln[] = response.packages?.map(
      (p) => ({
        ...p,
        maxVuln: p.vulns?.reduce(
          (prev, curr) => (prev.severity > curr.severity ? prev : curr),
          p.vulns?.[0]
        ),
      })
    );

    return {
      ...response,
      packages: pkgWithMaxVuln,
    };
  }
}
