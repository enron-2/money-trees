import { Controller } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // @Post()
  // create(@Body() createProjectDto: CreateProjectDto) {
  //   return this.projectsService.create(createProjectDto);
  // }

  // @Get()
  // findAll() {
  //   return this.projectsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.projectsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
  //   return this.projectsService.update(+id, updateProjectDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.projectsService.remove(+id);
  // }
}
