import { NestFactory } from '@nestjs/core';
import { ParserModule } from './parser.module';

async function bootstrap() {
  const app = await NestFactory.create(ParserModule);
  await app.listen(3000);
}
bootstrap();
