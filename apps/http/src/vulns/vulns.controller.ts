import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { VulnDto } from '../dto';
import { DtoConformInterceptor } from '../dto-conform.interceptor';
import { PaginationDto } from '../query-service.abstract';
import { VulnsService } from './vulns.service';

@ApiTags('Vulnerabilities')
@Controller('vulns')
export class VulnsController {
  constructor(private readonly vulnsService: VulnsService) {}

  @ApiOkResponse({
    type: [VulnDto],
  })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Get()
  findAll(
    @Query()
    { limit, lastKey }: PaginationDto,
  ): Promise<VulnDto[]> {
    return this.vulnsService.findAll(limit, lastKey);
  }

  @ApiOkResponse({
    type: VulnDto,
  })
  @UseInterceptors(new DtoConformInterceptor(VulnDto))
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<VulnDto> {
    const res = await this.vulnsService.findOne(id);
    if (!res) throw new NotFoundException();
    return res;
  }
}
