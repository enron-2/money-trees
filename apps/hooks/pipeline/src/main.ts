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
  const gitUrl = body.repository.git_url;
  const location = `/tmp/${repoName}-${Date.now()}`;

  /* call lambda with the below payloads to upload to code artifact */
  console.log(`Invoking ${process.env.CODE_ARTIFACT_UPLOAD_LAMBDA}`);
  let resp = new Lambda().invoke(
    {
      FunctionName: process.env.CODE_ARTIFACT_UPLOAD_LAMBDA,
      InvocationType: 'Event',
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
    },
    (err, data) => {
      if (err) {
        console.log(err);
        return { statusCode: 500, body: 'Failed to upload to Code Artifact' };
      }
      console.log(data);
      return {
        statusCode: 200,
        body: 'Successfully uploaded to Code Artifact',
      };
    }
  );
  console.log(resp);

  // parse package-lock.json
  console.log(`Invoking ${process.env.PARSER_LAMBDA}`);
  resp = new Lambda().invoke(
    {
      FunctionName: process.env.PARSER_LAMBDA,
      InvocationType: 'Event',
      Payload: JSON.stringify({
        owner: orgName,
        repo: repoName,
        token: token,
      }),
    },
    (err, data) => {
      if (err) {
        console.log(err);
        return { statusCode: 500, body: 'Failed to parse' };
      }
      console.log(data);
      return {
        statusCode: 200,
        body: 'Successfully parsed',
      };
    }
  );
  console.log(resp);

  // NOTE: lambda for scanner can be invoked here

  return {
    statusCode: 200,
    body: JSON.stringify(
      `Pipeline ran for https://github.com/${orgName}/${repoName}`
    ),
  };
};
