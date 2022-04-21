import { App, Environment } from '@aws-cdk/core';
import {
  DatabaseStack,
  HttpStack,
  ParserStack,
  HookStack,
  CodeArtifactStack,
  DashboardStack,
} from './stacks';

const env: Environment = {
  region: 'ap-southeast-2',
};
const app = new App();

for (const stageName of ['Sta' /*, 'Prd' */]) {
  const database = new DatabaseStack(app, `${stageName}Database`, { env });

  new HttpStack(app, `${stageName}Http`, {
    env,
    database,
    stageName,
  });

  const codeArtifact = new CodeArtifactStack(app, `${stageName}CodeArtifact`);

  const parser = new ParserStack(app, `${stageName}Parser`, {
    env,
    database,
    stageName,
    codeArtifactDomain: codeArtifact.CodeArtifactDomainName,
  });
  const parserLambda = parser.lambda;

  new HookStack(app, `${stageName}Hooks`, {
    env,
    stageName,
    parserLambda,
  });

  new DashboardStack(app, `${stageName}Dashboard`);
}
