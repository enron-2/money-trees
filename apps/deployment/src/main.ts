import { App, Environment } from '@aws-cdk/core';
import { DatabaseStack, HttpStack, ParserStack } from './stacks';

const env: Environment = {
  region: 'ap-southeast-2',
};
const app = new App();

for (const stageName of ['Sta' /*, 'Prd' */]) {
  const database = new DatabaseStack(app, `${stageName}Database`, { env });
  new HttpStack(app, `${stageName}Http`, { env, database, stageName });
  new ParserStack(app, `${stageName}Parser`, { env, database, stageName });
}
