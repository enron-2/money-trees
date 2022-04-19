import 'tslib';
import { APIGatewayEvent, Handler } from 'aws-lambda';
import { Octokit } from 'octokit';
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();

export const handler: Handler = async (event: APIGatewayEvent) => {
  const { SecretString: token } = await secretsManager
    .getSecretValue({ SecretId: 'GITHUB_TOKEN' })
    .promise();
  const octokit = new Octokit({ auth: token });

  await octokit.rest.orgs.createWebhook({
    org: process.env.ORG_NAME,
    name: 'web',
    events: ['push'],
    config: {
      url: process.env.WEBHOOK_URL,
      content_type: 'json',
    },
  });

  return {
    statusCode: 200,
  };
};
