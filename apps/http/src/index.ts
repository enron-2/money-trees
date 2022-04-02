import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Server } from 'http';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { createServer, proxy } from 'aws-serverless-express';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { HttpModule } from './app/http.module';

let server: Server;

async function bootstrap() {
  const expr = express();
  const app = await NestFactory.create(HttpModule, new ExpressAdapter(expr));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // TODO: allow only 'frontend' origin
  app.enableCors();

  await app.init();
  server = createServer(expr);
}

/**
 * Lambda handler
 */
export const handler = async (event: APIGatewayProxyEvent, ctx: Context) => {
  if (!server) await bootstrap();
  return proxy(server, event, ctx, 'PROMISE').promise;
};
