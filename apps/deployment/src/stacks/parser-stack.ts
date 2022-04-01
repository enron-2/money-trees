import { Stack, StackProps, Construct, Duration } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3n from '@aws-cdk/aws-s3-notifications';
import { DatabaseStack } from './database-stack';
import { join } from 'path';
import { NodeLambdaFunc } from '../constructs';

interface ParserStackProp extends StackProps {
  database: DatabaseStack;
  stageName: string;
}

export class ParserStack extends Stack {
  constructor(scope: Construct, id: string, props: ParserStackProp) {
    const { database, ...stackProps } = props;
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

    const parserLambda = new NodeLambdaFunc(this, 'ParserHandlerFunc', {
      code: lambda.Code.fromAsset(pathToCode),
      environment: {
        PROJECT_TABLE: database.Project.tableName,
        PACKAGE_TABLE: database.Package.tableName,
        VULN_TABLE: database.Vuln.tableName,
        DOMAIN: 'enron2',
      },
      timeout: Duration.seconds(30),
    }).LambdaFunction;

    database.grantReadAll(parserLambda);
    database.grantWrite(parserLambda, 'Package');
    database.grantWrite(parserLambda, 'Project');

    // TODO: if stageName == prod
    // Add 'cognito' or some other auth method

    // BUG: ??? Something here creates a python function that handles notification, why can't attach directly????

    const bucket = new s3.Bucket(this, `LockFileBucket`, {
      // TODO: handle access control to allow uploads from certain sources
      bucketName: `lock-file-bucket-${props.stageName}`,
    });
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(parserLambda)
    );
    bucket.grantRead(parserLambda);
  }
}
