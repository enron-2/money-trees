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
  ApiPropertyOptional,
  ApiTags,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { PackageDetailDto, PackageDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { PaginationDto } from '../query-service.abstract';
import { PackagesService } from './packages.service';

class PackageSearchInputDto extends PartialType(
  IntersectionType(OmitType(PackageDto, ['id', 'createdAt']), PaginationDto)
) {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Transform((param) => +param.value)
  @IsNumber()
  createdAt?: number;
}

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
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<PackageDto> {
    const res = await this.packagesService.findOne(id);
    if (!res) throw new NotFoundException();
    return res;
  }

  @ApiOperation({
    summary: 'Package with given ID including vulnerabilities',
  })
  @ApiOkResponse({
    type: PackageDetailDto,
  })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Get(':id/vulns')
  async vulnsInPackage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() { lastKey, limit = 10 }: PaginationDto
  ): Promise<PackageDetailDto> {
    const response = await this.packagesService.findOne(id);
    if (!response) throw new NotFoundException();

    const vulnIds = response.vulns as unknown as string[];
    let lastKeyIdx: number;
    if (lastKey) {
      lastKeyIdx = vulnIds.indexOf(lastKey);
      if (lastKeyIdx < 0) throw new NotFoundException('lastKey not found');
      response.vulns =
        response.vulns?.length - 1 > lastKeyIdx
          ? response.vulns.slice(lastKeyIdx + 1, lastKeyIdx + limit)
          : []; // no more items after lastKey
    } else {
      response.vulns = response.vulns?.slice(0, limit);
    }

    await response.populate();
    return response;
  }
}
