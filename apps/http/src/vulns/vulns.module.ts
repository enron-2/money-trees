import { Module } from '@nestjs/common';
import { VulnsService } from './vulns.service';
import { VulnsController } from './vulns.controller';

@Module({
  controllers: [VulnsController],
  providers: [VulnsService]
})
export class VulnsModule {}
