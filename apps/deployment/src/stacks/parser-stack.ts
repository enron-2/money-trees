import {
  Stack,
  StackProps,
  Construct,
  Duration,
  CfnParameter,
} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { DatabaseStack } from './database-stack';
import { join } from 'path';
import { NodeLambdaFunc } from '../constructs';
import * as iam from '@aws-cdk/aws-iam';

interface ParserStackProps extends StackProps {
  database: DatabaseStack;
  stageName: string;
  codeArtifactDomain: CfnParameter;
}

export class ParserStack extends Stack {
  lambda: lambda.Function;

  constructor(scope: Construct, id: string, props: ParserStackProps) {
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
        TABLE_NAME: database.table.tableName,
        DOMAIN: props.codeArtifactDomain.valueAsString,
      },
      timeout: Duration.seconds(30),
    }).LambdaFunction;

    database.grantRead(parserLambda);
    database.grantWrite(parserLambda);
    parserLambda.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess')
    );

    this.lambda = parserLambda;

    // TODO: if stageName == prod
    // Add 'cognito' or some other auth method
  }
}
