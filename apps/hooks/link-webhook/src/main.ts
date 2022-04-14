import { APIGatewayEvent, Handler } from 'aws-lambda';
import { Octokit } from 'octokit';

// TODO: get Peronal Access Token from KMS
const token = process.env.TOKEN;
const octokit = new Octokit({ auth: token });

interface githubWebhookEvent extends APIGatewayEvent {
  orgName: string;
  repoName: string;
  isPackage: boolean;
}

export const handler: Handler = async (event: githubWebhookEvent) => {
  const orgName = event.orgName;
  const repoName = event.repoName;
  const isPackage = event.isPackage;

  if (isPackage) {
    await octokit.rest.repos.createWebhook({
      owner: orgName,
      repo: repoName,
      config: {
        url: 'http://1f51-118-208-238-139.ngrok.io',
        secret: 'uwu',
        content_type: 'json',
      },
    });

    // TODO: connect CA
  } else {
    // TODO: remove webhook
    // TODO: remove CA
  }

  // TODO: update database

  return {
    statusCode: 200,
  };
};
