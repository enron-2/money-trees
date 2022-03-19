import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpModule } from './http.module';

async function bootstrap() {
  const app = await NestFactory.create(HttpModule);

  const config = new DocumentBuilder()
    .setTitle('Money Tr33s')
    .setDescription('The perfect place for shade')
    .build();
  const docs = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, docs);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
}
bootstrap();
