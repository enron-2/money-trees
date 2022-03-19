import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryController } from '../query-service.abstract';
import { PackagesService } from './packages.service';

@ApiTags('Packages')
@Controller('packages')
export class PackagesController extends QueryController {
  constructor(private readonly packagesService: PackagesService) {
    super(packagesService);
  }

  // TODO: handle pagination of vulns?
  @Get(':id/vulns')
  async vulnsInPackage(@Param('id', new ParseUUIDPipe()) id: string) {
    const response = await this.packagesService.findOne(id);
    if (!response) throw new NotFoundException();
    await response.populate();
    return response;
  }
}
