import { App, Environment } from '@aws-cdk/core';
import { DatabaseStack, HttpStack, ParserStack } from './stacks';

const env: Environment = {
  region: 'ap-southeast-2',
};
const app = new App();

const stagingDb = new DatabaseStack(app, 'StagingDatabase', { env });
new HttpStack(app, 'StagingHttpStack', {
  env,
  database: stagingDb,
  stageName: 'staging',
});
new ParserStack(app, 'StagingParserStack', {
  env,
  database: stagingDb,
  stageName: 'staging',
});

const prodDb = new DatabaseStack(app, 'ProdDatabase', { env });
new HttpStack(app, 'ProdHttpStack', {
  env,
  database: prodDb,
  stageName: 'prod',
});
new ParserStack(app, 'ProdParserStack', {
  env,
  database: prodDb,
  stageName: 'prod',
});
