import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PackageDetailDto, PackageDto, VulnDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { PaginationDto } from '../query-service.abstract';
import { CreateVulnInput, UpdateVulnInput } from './vulns.dto';
import { VulnsService } from './vulns.service';

@ApiTags('Vulnerabilities')
@Controller('vulns')
export class VulnsController {
  constructor(private readonly vulnsService: VulnsService) {}

  @ApiOkResponse({ type: [VulnDto] })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Get()
  findAll(@Query() { limit, lastKey }: PaginationDto): Promise<VulnDto[]> {
    return this.vulnsService.findAll(limit, lastKey);
  }

  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<VulnDto> {
    const res = await this.vulnsService.findOne(id);
    if (!res) throw new NotFoundException();
    return res;
  }

  @ApiCreatedResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Post()
  reportVuln(@Body() input: CreateVulnInput): Promise<VulnDto> {
    return this.vulnsService.create(input);
  }

  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Put(':id')
  updateVuln(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateVulnInput,
  ): Promise<VulnDto> {
    return this.vulnsService.update(id, input);
  }

  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Delete(':id')
  deleteVuln(@Param('id', new ParseUUIDPipe()) id: string): Promise<VulnDto> {
    return this.vulnsService.delete(id);
  }

  @ApiOkResponse({ type: [PackageDto] })
  @UseInterceptors(new DtoConformInterceptor(PackageDto))
  @Get(':vulnId/packages')
  packagesAffectedByVuln(
    @Param('vulnId', new ParseUUIDPipe()) vulnId: string,
    @Query() { limit, lastKey }: PaginationDto,
  ): Promise<PackageDto[]> {
    return this.vulnsService.packagesAffected(vulnId, limit, lastKey);
  }

  @ApiOkResponse({ type: PackageDetailDto })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Put(':vulnId/packages/:packageId')
  addVulnToPackage(
    @Param('vulnId', new ParseUUIDPipe()) vulnId: string,
    @Param('packageId', new ParseUUIDPipe()) packageId: string,
  ): Promise<PackageDetailDto> {
    return this.vulnsService.includePackage(vulnId, packageId);
  }

  @ApiOkResponse({ type: PackageDetailDto })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Delete(':vulnId/packages/:packageId')
  removeVulnFromPackage(
    @Param('vulnId', new ParseUUIDPipe()) vulnId: string,
    @Param('packageId', new ParseUUIDPipe()) packageId: string,
  ): Promise<PackageDetailDto> {
    return this.vulnsService.excludePackage(vulnId, packageId);
  }
}
