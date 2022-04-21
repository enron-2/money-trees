import 'tslib';
import { APIGatewayEvent, Handler } from 'aws-lambda';
import { Octokit } from 'octokit';
import { Lambda } from 'aws-sdk';
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();

interface RepoProps {
  name: string;
  owner: { name: string };
  master_branch: string;
  git_url: string;
}

export interface GithubWebhookPushEvent extends APIGatewayEvent {
  ref: string | undefined;
  repository?: RepoProps;
}

export const handler: Handler = async (event: GithubWebhookPushEvent) => {
  const { SecretString: token } = await secretsManager
    .getSecretValue({ SecretId: 'GITHUB_TOKEN' })
    .promise();

  // from registering initial webhook
  const isConnectRequest = event.ref === undefined;
  if (isConnectRequest) return { statusCode: 200, body: 'Setup success!' };

  const orgName = event.repository.owner.name;
  const repoName = event.repository.name;
  const branch = /refs\/heads\/(.*)/.exec(event.ref);
  const isMainBranch = branch && branch[1] === event.repository.master_branch;

  if (!isMainBranch) return { statusCode: 400, body: 'Not a main branch' };

  // upload to repository to Code Artifact
  const gitUrl = event.repository.git_url;
  const location = `/tmp/${repoName}-${Date.now()}`;

  /* call lambda with the below payloads to upload to code artifact */
  new Lambda({}).invoke({
    FunctionName: process.env.CODE_ARTIFACT_UPLOAD_LAMBDA,
    Payload: JSON.stringify({
      codeArtifactDomain: orgName,
      codeArtifactRepo: `private-${orgName}`,
      codeArtifactNamespace: orgName,
      gitOwner: orgName,
      gitRepoName: repoName,
      gitRepoUrl: gitUrl,
      gitToken: token,
      downloadLocation: location,
    }),
  });

  // parse package-lock.json
  const octokit = new Octokit({ auth: token });
  const resp = await octokit.rest.repos.getContent({
    owner: orgName,
    repo: repoName,
    path: 'package-lock.json',
  });

  new Lambda({}).invoke({
    FunctionName: process.env.PARSER_LAMBDA,
    Payload: JSON.stringify({
      content: (resp.data as any).content,
      owner: orgName,
      repo: repoName,
    }),
  });

  // NOTE: lambda for scanner can be invoked here

  return {
    statusCode: 200,
    body: JSON.stringify(
      `Pipeline ran for https://github.com/${orgName}/${repoName}`
    ),
  };
};
