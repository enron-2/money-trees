import { Stack, StackProps, Construct, CfnOutput } from '@aws-cdk/core';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Bucket } from '@aws-cdk/aws-s3';
import { join } from 'path';

export interface DashboardStackProps extends StackProps {
  stageName: string;
}

export class DashboardStack extends Stack {
  constructor(scope: Construct, id: string, props: DashboardStackProps) {
    super(scope, id, props);

    const rootDir = [__dirname, '..', '..', '..', '..'];
    const pathToCode = join(...rootDir, 'dist', 'apps', 'dashboard');

    const bucket = new Bucket(this, `${props.stageName}Bucket`, {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    new BucketDeployment(this, `${props.stageName}Deployment`, {
      sources: [Source.asset(pathToCode)],
      destinationBucket: bucket,
    });

    new CfnOutput(this, `${props.stageName}DashboardURL`, {
      value: bucket.bucketWebsiteUrl,
    });
  }
}
