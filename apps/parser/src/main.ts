import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Handler, S3CreateEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { ParserModule } from './app/parser.module';
import { ParserService } from './app/parser.service';

export const handler: Handler = async (event: S3CreateEvent) => {
  const app = await NestFactory.createApplicationContext(ParserModule);
  const parser = app.get(ParserService);
  const s3 = new S3({ logger: new Logger('aws-sdk/S3') });

  const results: string[] = [];
  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key);
    const bucketName = record.s3.bucket.arn.split(':').pop();
    const file = await s3
      .getObject({
        Key: key,
        Bucket: bucketName,
      })
      .promise();
    if (file.ContentLength === 0 || !file.Body)
      throw new Error('Body cannot be empty');
    const lockFileContent = await parser.createLockFile(
      file.Body.toString(),
      new Logger('createLockFile')
    );
    const [owner, name] = key.split('/');
    const res = await parser.saveFileContents(lockFileContent, {
      owner,
      name,
    });
    results.push(res);
  }
  await app.close();
  return results;
};
