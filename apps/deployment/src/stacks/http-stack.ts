import { Stack, StackProps, Construct, CfnOutput } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGw from '@aws-cdk/aws-apigateway';
import { join } from 'path';
import { DatabaseStack } from './database-stack';

interface HttpStackProp extends StackProps {
  database: DatabaseStack;
  lambdaConfig: Partial<lambda.FunctionProps>;
}

export class HttpStack extends Stack {
  apiURL: string;

  constructor(scope: Construct, id: string, props: HttpStackProp) {
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
      'http'
    );
    const httpLambda = new lambda.Function(this, 'HttpHandlerFunc', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(pathToCode),
      ...lambdaConfig,
      environment: {
        NODE_ENV: 'production',
      },
    });

    database.grantReadAll(httpLambda);
    database.grantWrite(httpLambda, 'Package');
    database.grantWrite(httpLambda, 'Vuln');

    const api = new apiGw.LambdaRestApi(this, 'RESTEndpoint', {
      handler: httpLambda,
      proxy: true,
    });

    new CfnOutput(this, 'API URL', {
      value: api.url ?? 'ERROR: No URL allocated',
    });

    this.apiURL = api.url;
  }
}
