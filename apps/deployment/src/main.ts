import { App, CfnParameter, Environment } from '@aws-cdk/core';
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

const CodeArtifactDomainName = new CfnParameter(app, 'CodeArtifactDomainName', {
  type: 'String',
  description: 'Domain name of CodeArtifact',
});

const GithubOrgName = new CfnParameter(app, 'GithubOrgName', {
  type: 'String',
  description: 'Github Organization Name',
});

for (const stageName of ['Sta' /*, 'Prd' */]) {
  const database = new DatabaseStack(app, `${stageName}Database`, { env });

  new HttpStack(app, `${stageName}Http`, {
    env,
    database,
    stageName,
  });

  const parser = new ParserStack(app, `${stageName}Parser`, {
    env,
    database,
    stageName,
    codeArtifactDomain: CodeArtifactDomainName,
  });
  const parserLambda = parser.lambda;

  new CodeArtifactStack(app, `${stageName}CodeArtifact`, {
    codeArtifactDomain: CodeArtifactDomainName,
  });

  new HookStack(app, `${stageName}Hooks`, {
    env,
    stageName,
    parserLambda,
    githubOrg: GithubOrgName,
  });

  new DashboardStack(app, `${stageName}Dashboard`);
}
