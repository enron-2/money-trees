import { Stack, StackProps, Construct } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { join } from 'path';
import { DatabaseStack } from './database-stack';

interface HttpStackProp extends StackProps {
  database: DatabaseStack;
  lambdaConfig: Partial<lambda.FunctionProps>;
}

export class HttpStack extends Stack {
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

    // FIX: Not working, integration created but not linked to lambda (cdk error)
    // After manually linking them together, still errors out
    // Should be a 'REST' api instead of HTTP (still {proxy+})

    // const api = new HttpApi(this, 'HttpEndpoint');
    // const proxyIntegration = new HttpUrlIntegration('HttpProxy', api.url);
    // api.addRoutes({
    //   path: '/{proxy+}',
    //   integration: proxyIntegration,
    // });

    // new CfnOutput(this, 'API URL', {
    //   value: api.url ?? 'ERROR: No URL allocated',
    // });
  }
}
