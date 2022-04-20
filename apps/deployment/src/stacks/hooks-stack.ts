import {
  Stack,
  StackProps,
  Construct,
  CfnOutput,
  Duration,
} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGw from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';
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

    // codeArtifactDockerLambda
    // vpc for lambda
    const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
        {
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // the lambda
    const codeArtifactDockerLambdaAppPath = join(
      __dirname,
      '..',
      '..',
      '..',
      'hooks',
      'pipeline',
      'code-artifact-docker'
    );

    const codeArtifactDockerLambda = new lambda.DockerImageFunction(
      this,
      'codeartifact-docker',
      {
        functionName: 'codeArtifactDockerLambda',
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        code: lambda.DockerImageCode.fromImageAsset(
          codeArtifactDockerLambdaAppPath,
          {
            entrypoint: ['/lambda-entrypoint.sh'],
          }
        ),
        timeout: Duration.seconds(90),
        memorySize: 8192,
      }
    );
    // attach policy
    codeArtifactDockerLambda.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite')
    );
    codeArtifactDockerLambda.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AWSCodeArtifactAdminAccess')
    );

    const uploadCodeArtifactIntegration = new apiGw.LambdaRestApi(
      this,
      'RESTEndpoint upload-codeartifact-api',
      {
        handler: codeArtifactDockerLambda,
      }
    );

    new CfnOutput(this, 'API URL codeartifact lambda', {
      value: uploadCodeArtifactIntegration.url ?? 'ERROR: No URL allocated',
    });

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
        CODE_ARTIFACT_UPLOAD_LAMBDA: codeArtifactDockerLambda.functionName,
      },
    });

    const pipelineApi = new apiGw.LambdaRestApi(
      this,
      'RESTEndpoint Pipeline Lambda',
      {
        handler: pipelineLambda,
        proxy: true,
        deployOptions: {
          stageName: props.stageName,
        },
        description: `REST endpoint for ${props.stageName}`,
      }
    );

    new CfnOutput(this, 'API URL pipeline', {
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
