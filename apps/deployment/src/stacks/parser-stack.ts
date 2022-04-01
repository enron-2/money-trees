import { Stack, StackProps, Construct } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3n from '@aws-cdk/aws-s3-notifications';
import { DatabaseStack } from './database-stack';
import { join } from 'path';

interface ParserStackProp extends StackProps {
  database: DatabaseStack;
  lambdaConfig: Partial<lambda.FunctionProps>;
}

export class ParserStack extends Stack {
  constructor(scope: Construct, id: string, props: ParserStackProp) {
    const { database, lambdaConfig, ...stackProps } = props;
    super(scope, id, stackProps);

    const pathToCode = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'dist',
      'apps',
      'parser'
    );
    const parserLambda = new lambda.Function(this, 'ParserHandlerFunc', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(pathToCode),
      ...lambdaConfig,
      environment: {
        ...lambdaConfig.environment,
        DOMAIN: 'enron2',
      },
    });

    database.grantReadAll(parserLambda);
    database.grantWrite(parserLambda, 'Package');
    database.grantWrite(parserLambda, 'Project');

    // BUG: ??? Something here creates a python function that handles notification, why can't attach directly????

    const bucket = new s3.Bucket(this, 'LockFileBucket', {
      // TODO: handle access control to allow uploads from certain sources
      bucketName: 'lock-file-bucket',
    });
    bucket.addObjectCreatedNotification(
      new s3n.LambdaDestination(parserLambda)
    );
    bucket.grantRead(parserLambda);
  }
}
