import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';

@Module({
  providers: [PackagesService],
  controllers: [PackagesController],
})
export class PackagesModule {}
