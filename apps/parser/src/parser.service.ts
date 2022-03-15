import { Injectable } from '@nestjs/common';

@Injectable()
export class ParserService {
  getHello(): string {
    return 'Hello World!';
  }
}
