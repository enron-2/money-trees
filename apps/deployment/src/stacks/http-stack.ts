import { Stack, StackProps, Construct, CfnOutput } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGw from '@aws-cdk/aws-apigateway';
import { join } from 'path';
import { DatabaseStack } from './database-stack';
import { NodeLambdaFunc } from '../constructs';

interface HttpStackProps extends StackProps {
  database: DatabaseStack;
  stageName: string;
}

export class HttpStack extends Stack {
  apiURL: string;

  constructor(scope: Construct, id: string, props: HttpStackProps) {
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

    const httpLambda = new NodeLambdaFunc(
      this,
      `${props.stageName}HttpHandlerFunc`,
      {
        code: lambda.Code.fromAsset(pathToCode),
        environment: {
          TABLE_NAME: database.table.tableName,
        },
      }
    ).LambdaFunction;

    database.grantRead(httpLambda);
    database.grantWrite(httpLambda);

    const api = new apiGw.LambdaRestApi(
      this,
      `${props.stageName}RESTEndpoint`,
      {
        handler: httpLambda,
        proxy: true,
        deployOptions: {
          stageName: props.stageName,
        },
        description: `REST endpoint for ${props.stageName}`,
        defaultCorsPreflightOptions: {
          // TODO: allow only 'frontend' origin
          allowOrigins: apiGw.Cors.ALL_ORIGINS,
          allowMethods: apiGw.Cors.ALL_METHODS,
          allowHeaders: apiGw.Cors.DEFAULT_HEADERS,
        },
      }
    );

    new CfnOutput(this, `${props.stageName}HttpApiURL`, {
      value: api.url ?? 'ERROR: No URL allocated',
    });

    this.apiURL = api.url;
  }
}
