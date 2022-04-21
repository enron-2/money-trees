import 'tslib';
import { APIGatewayEvent, Handler } from 'aws-lambda';
import { Lambda } from 'aws-sdk';
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();

interface GitHubRequestBody {
  ref?: string;
  repository?: RepoProps;
}

interface RepoProps {
  name: string;
  owner: { name: string };
  master_branch: string;
  git_url: string;
}

export interface GithubWebhookPushEvent extends APIGatewayEvent {
  body: string;
}

export const handler: Handler = async (event: GithubWebhookPushEvent) => {
  const { SecretString } = await secretsManager
    .getSecretValue({ SecretId: 'GITHUB_TOKEN' })
    .promise();
  const token = JSON.parse(SecretString).GITHUB_TOKEN;

  // from registering initial webhook
  const body = JSON.parse(event.body) as GitHubRequestBody;
  const isSetupRequest = body.ref === undefined;
  if (isSetupRequest) return { statusCode: 200, body: 'Setup success!' };

  const orgName = body.repository.owner.name;
  const repoName = body.repository.name;
  const branch = /refs\/heads\/(.*)/.exec(body.ref);
  const isMainBranch = branch && branch[1] === body.repository.master_branch;

  if (!isMainBranch) return { statusCode: 400, body: 'Not a main branch' };

  // upload to repository to Code Artifact
  const location = `/tmp/${repoName}-${Date.now()}`;

  /* call lambda with the below payloads to upload to code artifact */
  const lambda = new Lambda({ region: 'ap-southeast-2' });

  console.log(`Invoking ${process.env.CODE_ARTIFACT_UPLOAD_LAMBDA}`);
  await lambda
    .invoke({
      FunctionName: process.env.CODE_ARTIFACT_UPLOAD_LAMBDA,
      InvocationType: 'Event',
      Payload: JSON.stringify({
        codeArtifactDomain: orgName,
        codeArtifactRepo: `private-${orgName}`,
        gitOwner: orgName,
        gitRepoName: repoName,
        gitToken: token,
        downloadLocation: location,
      }),
    })
    .promise();

  // parse package-lock.json
  console.log(`Invoking ${process.env.PARSER_LAMBDA}`);
  await lambda
    .invoke({
      FunctionName: process.env.PARSER_LAMBDA,
      InvocationType: 'Event',
      Payload: JSON.stringify({
        owner: orgName,
        repo: repoName,
        token: token,
      }),
    })
    .promise();

  // NOTE: lambda for scanner can be invoked here

  return {
    statusCode: 200,
    body: JSON.stringify(`Pipeline ran for ${orgName}/${repoName}`),
  };
};
