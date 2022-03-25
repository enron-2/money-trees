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
  IntersectionType(OmitType(PackageDto, ['id', 'createdAt']), PaginationDto),
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

  @ApiOkResponse({
    type: [PackageDto],
  })
  @UseInterceptors(new DtoConformInterceptor(PackageDto))
  @Get()
  findAll(
    @Query()
    { limit, lastKey, ...query }: PackageSearchInputDto,
  ): Promise<PackageDto[]> {
    return this.packagesService.findAll(limit, lastKey, query);
  }

  @ApiOkResponse({
    type: PackageDto,
  })
  @UseInterceptors(new DtoConformInterceptor(PackageDto))
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PackageDto> {
    const res = await this.packagesService.findOne(id);
    if (!res) throw new NotFoundException();
    return res;
  }

  // TODO: handle pagination of vulns?
  @ApiOkResponse({
    type: PackageDetailDto,
  })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Get(':id/vulns')
  async vulnsInPackage(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PackageDetailDto> {
    const response = await this.packagesService.findOne(id);
    if (!response) throw new NotFoundException();
    await response.populate();
    return response;
  }
}
