import { App, Environment } from '@aws-cdk/core';
import { DatabaseStack, HttpStack, ParserStack } from './stacks';

const app = new App();
const env: Environment = {
  region: 'ap-southeast-2',
};
const database = new DatabaseStack(app, 'Database', { env });
new HttpStack(app, 'HttpStack', {
  env,
  database,
});
new ParserStack(app, 'ParserStack', {
  env,
  database,
});
