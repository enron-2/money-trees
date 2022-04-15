import { Stack, StackProps, Construct, Duration } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { DatabaseStack } from './database-stack';
import { join } from 'path';
import { NodeLambdaFunc } from '../constructs';

interface ParserStackProps extends StackProps {
  database: DatabaseStack;
  stageName: string;
}

export class ParserStack extends Stack {
  lambdaName: string;

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
        DOMAIN: 'enron2',
      },
      timeout: Duration.seconds(30),
    }).LambdaFunction;

    this.lambdaName = parserLambda.functionName;

    database.grantRead(parserLambda);
    database.grantWrite(parserLambda);

    // TODO: if stageName == prod
    // Add 'cognito' or some other auth method
  }
}
