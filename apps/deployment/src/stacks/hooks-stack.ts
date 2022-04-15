import {
  Stack,
  StackProps,
  Construct,
  CfnOutput,
  Duration,
} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGw from '@aws-cdk/aws-apigateway';
import { join } from 'path';

interface HookStackProps extends StackProps {
  stageName: string;
  backendURL: string;
  parserLambdaName: string;
}

export class HookStack extends Stack {
  pipelineLinkerApiURL: string;
  constructor(scope: Construct, id: string, props: HookStackProps) {
    super(scope, id, props);

    // Pipeline
    const pipelineAppPath = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'dist',
      'apps',
      'hooks',
      'pipeline'
    );

    const pipelineLambda = new lambda.Function(this, 'pipeline-lambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'main.handler',
      memorySize: 256,
      timeout: Duration.seconds(30),
      code: lambda.Code.fromAsset(pipelineAppPath),
      environment: {
        BACKEND_URL: props.backendURL,
        PARSER_LAMBDA: props.parserLambdaName,
      },
    });

    const pipelineApi = new apiGw.LambdaRestApi(this, 'RESTEndpoint', {
      handler: pipelineLambda,
      proxy: true,
      deployOptions: {
        stageName: props.stageName,
      },
      description: `REST endpoint for ${props.stageName}`,
    });

    new CfnOutput(this, 'API URL', {
      value: pipelineApi.url ?? 'ERROR: No URL allocated',
    });

    // Setup webhook
    const linkPipelineAppPath = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'dist',
      'apps',
      'hooks',
      'link-webhook'
    );

    const pipelineLinkerLambda = new lambda.Function(
      this,
      'link-webhook-lambda',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'main.handler',
        memorySize: 256,
        timeout: Duration.seconds(10),
        code: lambda.Code.fromAsset(linkPipelineAppPath),
        environment: {
          WEBHOOK_URL: pipelineApi.url,
        },
      }
    );

    const pipelineLinkerApi = new apiGw.LambdaRestApi(this, 'RESTEndpoint', {
      handler: pipelineLinkerLambda,
      proxy: true,
      deployOptions: {
        stageName: props.stageName,
      },
      description: `REST endpoint for ${props.stageName}`,
    });

    new CfnOutput(this, 'API URL', {
      value: pipelineLinkerApi.url ?? 'ERROR: No URL allocated',
    });

    this.pipelineLinkerApiURL = pipelineLinkerApi.url;
  }
}
