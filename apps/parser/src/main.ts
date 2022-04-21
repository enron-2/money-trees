import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { InvocationRequest } from 'aws-sdk/clients/lambda';
import { ParserModule } from './app/parser.module';
import { ParserService } from './app/parser.service';
import { Octokit } from 'octokit';

interface ParserProps extends InvocationRequest {
  owner: string;
  repo: string;
  token: string;
}

export const handler: Handler<InvocationRequest, string> = async (
  event: ParserProps
) => {
  const app = await NestFactory.createApplicationContext(ParserModule);
  const parser = app.get(ParserService);
  parser.domain = process.env.DOMAIN;

  const octokit = new Octokit({ auth: event.token });
  const resp = await octokit.rest.repos.getContent({
    owner: event.owner,
    repo: event.repo,
    path: 'package-lock.json',
  });
  const content = (resp.data as any).content;
  const decoded = Buffer.from(content, 'base64').toString('utf8');

  const lockFileContent = await parser.createLockFile(
    decoded,
    new Logger('createLockFile')
  );

  const res = await parser.saveFileContents(lockFileContent, {
    owner: event.owner,
    name: event.repo,
  });

  await app.close();

  return res;
};
