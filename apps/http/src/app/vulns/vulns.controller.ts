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
  ApiTags,
} from '@nestjs/swagger';
import { PackageDetailDto, PackageDto, PaginationDto, VulnDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { CreateVulnInput, UpdateVulnInput } from './vulns.dto';
import { VulnsService } from './vulns.service';

// class VulnSearchInputDto extends PartialType(
//   IntersectionType(OmitType(VulnDto, ['id', 'severity']), PaginationDto)
// ) {
//   @ApiPropertyOptional({ minimum: 1 })
//   @IsOptional()
//   @Transform((param) => +param.value)
//   @IsInt()
//   @IsPositive()
//   severity?: number;
// }

@ApiTags('Vulnerabilities')
@Controller('vulns')
export class VulnsController {
  constructor(private readonly vulnsService: VulnsService) {}

  // @ApiOperation({
  //   summary: 'All vulnerabilities',
  //   description:
  //     'Query for vulnerabilities uses the AND operator and you can paginate by supplying at least the lastKey param',
  // })
  // @ApiOkResponse({ type: [VulnDto] })
  // @UseInterceptors(new DtoConformInterceptor(VulnDto))
  // @Get()
  // findAll(
  //   @Query() { limit, lastKey, ...query }: VulnSearchInputDto
  // ): Promise<VulnDto[]> {
  //   throw new NotImplementedException();
  // }

  @ApiOperation({ summary: 'Vulnerability with given ID' })
  @ApiOkResponse({ type: VulnDto })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VulnDto> {
    return this.vulnsService.findOne(id);
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
    @Param('id') id: string,
    @Body() input: UpdateVulnInput
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
  deleteVuln(@Param('id') id: string): Promise<VulnDto> {
    return this.vulnsService.delete(id);
  }

  @ApiOperation({
    summary: 'Packages affected by vulnerability with given ID',
  })
  @ApiOkResponse({ type: [PackageDto] })
  @UseInterceptors(new DtoConformInterceptor(PackageDto))
  @Get(':vulnId/packages')
  packagesAffectedByVuln(
    @Param('vulnId') vulnId: string,
    @Query() { limit, lastKey }: PaginationDto
  ): Promise<PackageDto[]> {
    return this.vulnsService.packagesAffected(vulnId, limit, lastKey);
  }

  @ApiOperation({ summary: 'Link 1 package to 1 vulnerability' })
  // @ApiOkResponse({ type: PackageDetailDto })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Put(':vulnId/packages/:packageId')
  async addVulnToPackage(
    @Param('packageId') packageId: string,
    @Param('vulnId') vulnId: string
  ) {
    await this.vulnsService.linkToPkg(packageId, vulnId);
  }

  @ApiOperation({ summary: 'Unlink 1 package to 1 vulnerability' })
  // @ApiOkResponse({ type: PackageDetailDto })
  @UseInterceptors(new DtoConformInterceptor(PackageDetailDto))
  @Delete(':vulnId/packages/:packageId')
  async removeVulnFromPackage(
    @Param('packageId') packageId: string,
    @Param('vulnId') vulnId: string
  ) {
    await this.vulnsService.unlinkFromPkg(packageId, vulnId);
  }
}
