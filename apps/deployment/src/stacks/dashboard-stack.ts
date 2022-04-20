import { Stack, StackProps, Construct } from '@aws-cdk/core';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Bucket } from '@aws-cdk/aws-s3';
import { join } from 'path';

export class DashboardStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const rootDir = [__dirname, '..', '..', '..', '..'];
    const pathToCode = join(...rootDir, 'dist', 'apps', 'dashboard');

    const bucket = new Bucket(this, 'Bucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    new BucketDeployment(this, 'Deployment', {
      sources: [Source.asset(pathToCode)],
      destinationBucket: bucket,
    });
  }
}
