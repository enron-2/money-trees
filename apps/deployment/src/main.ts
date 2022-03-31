import { App, Duration, Environment } from '@aws-cdk/core';
import type { FunctionProps } from '@aws-cdk/aws-lambda';
import { DatabaseStack, HttpStack, ParserStack } from './stacks';

const app = new App();
const env: Environment = {
  region: 'ap-southeast-2',
};
const lambdaConfig: Partial<FunctionProps> = {
  memorySize: 256,
  timeout: Duration.seconds(5),
};

const database = new DatabaseStack(app, 'Database', { env });
new HttpStack(app, 'HttpStack', {
  env,
  database,
  lambdaConfig,
});
new ParserStack(app, 'ParserStack', {
  env,
  database,
  lambdaConfig,
});
