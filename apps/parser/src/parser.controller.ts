import { Controller, Get } from '@nestjs/common';
import { ParserService } from './parser.service';

@Controller()
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Get()
  getHello(): string {
    return this.parserService.getHello();
  }
}
