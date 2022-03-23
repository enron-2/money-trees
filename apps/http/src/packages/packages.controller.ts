import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PackageDetailDto, PackageDto } from '../dto';
import { PaginationDto } from '../query-service.abstract';
import { PackagesService } from './packages.service';

@ApiTags('Packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @ApiOkResponse({
    type: [PackageDto],
  })
  @Get()
  findAll(
    @Query()
    { limit, lastKey }: PaginationDto,
  ): Promise<PackageDto[]> {
    return this.packagesService.findAll(limit, lastKey);
  }

  @ApiOkResponse({
    type: PackageDto,
  })
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
