import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { IdExistsPipe, RegexPipe } from '@core/pipes';
import { PackageDetailDto, PackageDto, PaginationDto, VulnDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { CreateVulnInput, UpdateVulnInput } from './vulns.dto';
import { VulnsService } from './vulns.service';

const PkgIdPipe = new RegexPipe(/^PKG#/);
const VlnIdPipe = new RegexPipe(/^VLN#/);

class VulnSearchInputDto extends PartialType(
  IntersectionType(OmitType(VulnDto, ['id', 'severity']), PaginationDto)
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
  async findAll(
    @Query() { limit, lastKey, ...query }: VulnSearchInputDto
  ): Promise<VulnDto[]> {
    const entities = await this.vulnsService.findAll(limit, lastKey, query);
    return entities.map((e) => e.toPlain());
  }

  @ApiOperation({ summary: 'Vulnerability with given ID' })
  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Get(':id')
  async findOne(@Param('id', IdExistsPipe) id: string): Promise<VulnDto> {
    return this.vulnsService.findOne(id).then((v) => v.toPlain());
  }

  @ApiOperation({ summary: 'Report new vulnerability' })
  @ApiCreatedResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Post()
  async reportVuln(@Body() input: CreateVulnInput): Promise<VulnDto> {
    const vln = await this.vulnsService.create(input);
    return vln.toPlain();
  }

  @ApiOperation({ summary: 'Update vulnerability with given ID' })
  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Put(':id')
  updateVuln(
    @Param('id', IdExistsPipe) id: string,
    @Body()
    input: UpdateVulnInput
  ) {
    return this.vulnsService.update(id, input);
  }

  @ApiOperation({
    summary: 'Delete vulnerability with given ID',
    description: 'Also remove vulnerability from all packages affected',
  })
  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Delete(':id')
  async deleteVuln(@Param('id', IdExistsPipe) id: string): Promise<VulnDto> {
    const vln = await this.vulnsService.delete(id);
    return vln.toPlain();
  }

  @ApiOperation({
    summary: 'Packages affected by vulnerability with given ID',
  })
  @ApiOkResponse({ type: [PackageDto] })
  @UseInterceptors(new DtoConformInterceptor(PackageDto))
  @Get(':vulnId/packages')
  packagesAffectedByVuln(
    @Param('vulnId', VlnIdPipe, IdExistsPipe) vulnId: string,
    @Query() { limit, lastKey }: PaginationDto
  ): Promise<PackageDto[]> {
    return this.vulnsService.packagesAffected(vulnId, limit, lastKey);
  }

  @ApiOperation({ summary: 'Link 1 package to 1 vulnerability' })
  @ApiOkResponse({ description: 'Link successful' })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Put(':vulnId/packages/:packageId')
  async addVulnToPackage(
    @Param('packageId', PkgIdPipe, IdExistsPipe) packageId: string,
    @Param('vulnId', VlnIdPipe, IdExistsPipe) vulnId: string
  ) {
    await this.vulnsService.linkToPkg(packageId, vulnId);
  }

  @ApiOperation({ summary: 'Unlink 1 package to 1 vulnerability' })
  @ApiOkResponse({ description: 'Unlink successful' })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Delete(':vulnId/packages/:packageId')
  async removeVulnFromPackage(
    @Param('packageId', PkgIdPipe, IdExistsPipe) packageId: string,
    @Param('vulnId', VlnIdPipe, IdExistsPipe) vulnId: string
  ) {
    await this.vulnsService.unlinkFromPkg(packageId, vulnId);
  }
}
