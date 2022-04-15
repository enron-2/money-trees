import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { InvocationRequest } from 'aws-sdk/clients/lambda';
import { ParserModule } from './app/parser.module';
import { ParserService } from './app/parser.service';

export type PayloadInterface = {
  /** b64 encoded or something idfk */
  content: string;
  owner: string;
  repo: string;
};

export const handler: Handler<InvocationRequest, string> = async (
  event: InvocationRequest
) => {
  const app = await NestFactory.createApplicationContext(ParserModule);
  const parser = app.get(ParserService);
  parser.domain = process.env.DOMAIN;

  const payload: PayloadInterface = JSON.parse(event.Payload.toString());
  const decoded = Buffer.from(payload.content, 'base64').toString('utf8');

  const lockFileContent = await parser.createLockFile(
    decoded,
    new Logger('createLockFile')
  );

  const res = await parser.saveFileContents(lockFileContent, {
    owner: payload.owner,
    name: payload.repo,
  });

  await app.close();

  return res;
};
