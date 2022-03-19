import { Controller } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // @Post()
  // create(@Body() createPackageDto: CreatePackageDto) {
  //   return this.packagesService.create(createPackageDto);
  // }

  // @Get()
  // findAll() {
  //   return this.packagesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.packagesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
  //   return this.packagesService.update(+id, updatePackageDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.packagesService.remove(+id);
  // }
}
