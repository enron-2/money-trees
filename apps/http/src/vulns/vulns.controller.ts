import { Controller } from '@nestjs/common';
import { VulnsService } from './vulns.service';

@Controller('vulns')
export class VulnsController {
  constructor(private readonly vulnsService: VulnsService) {}

  // @Post()
  // create(@Body() createVulnDto: CreateVulnDto) {
  //   return this.vulnsService.create(createVulnDto);
  // }

  // @Get()
  // findAll() {
  //   return this.vulnsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.vulnsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateVulnDto: UpdateVulnDto) {
  //   return this.vulnsService.update(+id, updateVulnDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.vulnsService.remove(+id);
  // }
}
