import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpModule } from './http.module';

/**
 * NOT FOR PRODUCTION
 * Used to locally test api and inspect API documentation
 */
async function bootstrap() {
  const app = await NestFactory.create(HttpModule);

  const config = new DocumentBuilder()
    .setTitle('Money Tr33s')
    .setDescription('The perfect place for shade')
    .setVersion('Untested, response schema may be incorrect')
    .build();
  const docs = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, docs);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(3000);
}
bootstrap();
