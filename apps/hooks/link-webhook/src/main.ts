import { APIGatewayEvent, Handler } from 'aws-lambda';
import { Octokit } from 'octokit';
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();

interface githubWebhookEvent extends APIGatewayEvent {
  orgName: string;
  repoName: string;
  isPackage: boolean;
}

export const handler: Handler = async (event: githubWebhookEvent) => {
  const { SecretString: token } = await secretsManager
    .getSecretValue({ SecretId: 'GITHUB_TOKEN' })
    .promise();
  const octokit = new Octokit({ auth: token });

  const orgName = event.orgName;
  await octokit.rest.orgs.createWebhook({
    org: orgName,
    name: 'web',
    events: ['push'],
    config: {
      url: 'http://1f51-118-208-238-139.ngrok.io',
      content_type: 'json',
    },
  });

  return {
    statusCode: 200,
  };
};
