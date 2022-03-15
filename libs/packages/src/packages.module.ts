import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Module({
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
