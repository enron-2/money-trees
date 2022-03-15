import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpService {
  getHello(): string {
    return 'Hello World!';
  }
}
