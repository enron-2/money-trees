import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { PackageEntity } from '@schemas/entities';
import { EnumValidationPipe } from '@core/pipes';
import { SortOrder } from 'dynamoose/dist/General';
import {
  PackageDetailDto,
  PackageDto,
  PaginationDto,
  ProjectDto,
} from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { PackagesService } from './packages.service';

class PackageSearchInputDto extends PartialType(
  IntersectionType(OmitType(PackageEntity, ['type', 'id']), PaginationDto)
) {}

@ApiTags('Packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @ApiOperation({
    summary: 'All packages',
    description:
      'Query for packages uses the AND operator and you can paginate by supplying at least the lastKey param',
  })
  @ApiOkResponse({
    type: [PackageDto],
  })
  @UseInterceptors(new DtoConformInterceptor(PackageDto))
  @Get()
  findAll(
    @Query()
    { limit, lastKey, ...query }: PackageSearchInputDto
  ): Promise<PackageDto[]> {
    return this.packagesService.findAll(limit, lastKey, query);
  }

  @ApiOperation({ summary: 'Package with given ID' })
  @ApiOkResponse({
    type: PackageDto,
  })
  @UseInterceptors(new DtoConformInterceptor(PackageDto))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PackageDto> {
    const pkg = await this.packagesService.findOne(id);
    if (!pkg) throw new NotFoundException();
    return pkg;
  }

  @ApiOperation({
    summary: 'Package with given ID including vulnerabilities',
  })
  @ApiOkResponse({
    type: PackageDetailDto,
  })
  @ApiQuery({
    name: 'sort',
    enum: SortOrder,
    description: 'Sorts vulnerabilities returned',
    required: false,
  })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Get(':id/vulns')
  async vulnsInPackage(
    @Param('id') id: string,
    @Query() { lastKey, limit }: PaginationDto,
    @Query('sort', new EnumValidationPipe(SortOrder, { optional: true }))
    sort?: SortOrder
  ): Promise<PackageDetailDto> {
    return this.packagesService.findOneWithVulns(id, lastKey, sort, limit);
  }

  @ApiOperation({
    summary: 'List of projects using a package',
  })
  @ApiOkResponse({
    type: [ProjectDto],
  })
  @ApiQuery({
    name: 'sort',
    enum: SortOrder,
    description: 'Package name alphanumeric sorting',
    required: false,
  })
  @UseInterceptors(new DtoConformInterceptor(ProjectDto))
  @Get(':id/projects')
  async projectsUsingPackage(
    @Param('id') id: string,
    @Query() { lastKey, limit }: PaginationDto,
    @Query('sort', new EnumValidationPipe(SortOrder, { optional: true }))
    sort?: SortOrder
  ) {
    return this.packagesService.findProjectConsumingPackage(
      id,
      lastKey,
      sort,
      limit
    );
  }
}
