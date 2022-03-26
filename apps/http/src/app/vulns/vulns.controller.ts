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
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { PackageDetailDto, PackageDto, VulnDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { PaginationDto } from '../query-service.abstract';
import { CreateVulnInput, UpdateVulnInput } from './vulns.dto';
import { VulnsService } from './vulns.service';

class VulnSearchInputDto extends PartialType(
  IntersectionType(OmitType(VulnDto, ['id', 'severity']), PaginationDto),
) {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Transform((param) => +param.value)
  @IsInt()
  @IsPositive()
  severity?: number;
}

@ApiTags('Vulnerabilities')
@Controller('vulns')
export class VulnsController {
  constructor(private readonly vulnsService: VulnsService) {}

  @ApiOperation({
    summary: 'All vulnerabilities',
    description:
      'Query for vulnerabilities uses the AND operator and you can paginate by supplying at least the lastKey param',
  })
  @ApiOkResponse({ type: [VulnDto] })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Get()
  findAll(
    @Query() { limit, lastKey, ...query }: VulnSearchInputDto,
  ): Promise<VulnDto[]> {
    return this.vulnsService.findAll(limit, lastKey, query);
  }

  @ApiOperation({ summary: 'Vulnerability with given ID' })
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

  @ApiOperation({ summary: 'Report new vulnerability' })
  @ApiCreatedResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Post()
  reportVuln(@Body() input: CreateVulnInput): Promise<VulnDto> {
    return this.vulnsService.create(input);
  }

  @ApiOperation({ summary: 'Update vulnerability with given ID' })
  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Put(':id')
  updateVuln(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateVulnInput,
  ): Promise<VulnDto> {
    return this.vulnsService.update(id, input);
  }

  @ApiOperation({
    summary: 'Delete vulnerability with given ID',
    description: 'Also remove vulnerability from all packages affected',
  })
  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Delete(':id')
  deleteVuln(@Param('id', new ParseUUIDPipe()) id: string): Promise<VulnDto> {
    return this.vulnsService.delete(id);
  }

  @ApiOperation({
    summary: 'Packages affected by vulnerability with given ID',
  })
  @ApiOkResponse({ type: [PackageDto] })
  @UseInterceptors(new DtoConformInterceptor(PackageDto))
  @Get(':vulnId/packages')
  packagesAffectedByVuln(
    @Param('vulnId', new ParseUUIDPipe()) vulnId: string,
    @Query() { limit, lastKey }: PaginationDto,
  ): Promise<PackageDto[]> {
    return this.vulnsService.packagesAffected(vulnId, limit, lastKey);
  }

  @ApiOperation({ summary: 'Link 1 package to 1 vulnerability' })
  @ApiOkResponse({ type: PackageDetailDto })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Put(':vulnId/packages/:packageId')
  addVulnToPackage(
    @Param('vulnId', new ParseUUIDPipe()) vulnId: string,
    @Param('packageId', new ParseUUIDPipe()) packageId: string,
  ): Promise<PackageDetailDto> {
    return this.vulnsService.includePackage(vulnId, packageId);
  }

  @ApiOperation({ summary: 'Unlink 1 package to 1 vulnerability' })
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
