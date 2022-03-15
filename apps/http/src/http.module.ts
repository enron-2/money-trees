import { Module } from '@nestjs/common';
import { HttpController } from './http.controller';
import { HttpService } from './http.service';

@Module({
  imports: [],
  controllers: [HttpController],
  providers: [HttpService],
})
export class HttpModule {}
