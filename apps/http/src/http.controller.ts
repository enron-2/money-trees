import { Controller, Get } from '@nestjs/common';
import { HttpService } from './http.service';

@Controller()
export class HttpController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  getHello(): string {
    return this.httpService.getHello();
  }
}
