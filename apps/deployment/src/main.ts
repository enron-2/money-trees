import { App, Environment } from '@aws-cdk/core';
import { DatabaseStack, HttpStack, ParserStack, HookStack } from './stacks';

const env: Environment = {
  region: 'ap-southeast-2',
};
const app = new App();

for (const stageName of ['Sta' /*, 'Prd' */]) {
  const database = new DatabaseStack(app, `${stageName}Database`, { env });

  const backend = new HttpStack(app, `${stageName}Http`, {
    env,
    database,
    stageName,
  });
  const backendURL = backend.apiURL;

  const parser = new ParserStack(app, `${stageName}Parser`, {
    env,
    database,
    stageName,
  });
  const parserLambdaName = parser.lambdaName;

  const hooks = new HookStack(app, `${stageName}Hooks`, {
    env,
    stageName,
    parserLambdaName,
  });
  const pipelineSetupURL = hooks.pipelineLinkerApiURL;

  // TODO: add frontend, passing in backendURL
}
