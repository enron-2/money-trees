import { Module } from '@nestjs/common';
import { VulnsService } from './vulns.service';
import { VulnsController } from './vulns.controller';
import { PackagesModule } from '../packages/packages.module';

@Module({
  imports: [PackagesModule],
  controllers: [VulnsController],
  providers: [VulnsService],
})
export class VulnsModule {}
