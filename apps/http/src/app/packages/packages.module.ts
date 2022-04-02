import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  providers: [PackagesService],
  exports: [PackagesService],
  controllers: [PackagesController],
})
export class PackagesModule {}
