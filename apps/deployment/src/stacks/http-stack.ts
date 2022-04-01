import { Stack, StackProps, Construct, CfnOutput } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGw from '@aws-cdk/aws-apigateway';
import { join } from 'path';
import { DatabaseStack } from './database-stack';
import { NodeLambdaFunc } from '../constructs';

interface HttpStackProp extends StackProps {
  database: DatabaseStack;
  stageName: string;
}

export class HttpStack extends Stack {
  apiURL: string;

  constructor(scope: Construct, id: string, props: HttpStackProp) {
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
      'http'
    );

    const httpLambda = new NodeLambdaFunc(this, 'HttpHandlerFunc', {
      code: lambda.Code.fromAsset(pathToCode),
      environment: {
        PROJECT_TABLE: database.Project.tableName,
        PACKAGE_TABLE: database.Package.tableName,
        VULN_TABLE: database.Vuln.tableName,
      },
    }).LambdaFunction;

    database.grantReadAll(httpLambda);
    database.grantWrite(httpLambda, 'Package');
    database.grantWrite(httpLambda, 'Vuln');

    const api = new apiGw.LambdaRestApi(this, 'RESTEndpoint', {
      handler: httpLambda,
      proxy: true,
      deployOptions: {
        stageName: props.stageName,
      },
    });

    new CfnOutput(this, 'API URL', {
      value: api.url ?? 'ERROR: No URL allocated',
    });

    this.apiURL = api.url;
  }
}
