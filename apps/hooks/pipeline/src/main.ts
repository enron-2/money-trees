import { APIGatewayEvent, Handler } from 'aws-lambda';
import { Octokit } from 'octokit';
import { exec } from 'child_process';
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

  const orgName = event.repository.owner.name;
  const repoName = event.repository.name;
  const branch = /refs\/heads\/(.*)/.exec(event.ref);
  const isMainBranch = branch && branch[1] === event.repository.master_branch;
  const isConnectRequest = event.ref === undefined; // register initial webhook

  // check for package
  const backendURL = process.env.BACKEND_URL;
  const { status } = await fetch(
    `${backendURL}/projects/${encodeURIComponent(`PRJ#${orgName}/${repoName}`)}`
  );
  const isPackage = status === 404;

  if (isConnectRequest || !isMainBranch)
    return { statusCode: 400, body: 'Not a main branch' };

  if (isPackage) {
    // upload to repository to Code Artifact
    const gitUrl = event.repository.git_url;
    const location = `/tmp/${repoName}-${Date.now()}`;

    /* TODO call lambda with the below payloads */

    /* 
      codeArtifactDomain: orgname
      codeArtifactRepo: private_orgname
      codeArtifactNamespace: orgname
      gitRepo: gitUrl,
      gitToken: token,
      downloadLocation: location,
    */
  } else {
    // parse package-lock.json

    const octokit = new Octokit({ auth: token });
    const resp = await octokit.rest.repos.getContent({
      owner: orgName,
      repo: repoName,
      path: 'package-lock.json',
    });

    const lambdaName = process.env.PARSER_LAMBDA;
    new Lambda({}).invoke({
      FunctionName: lambdaName,
      Payload: JSON.stringify({
        content: (resp.data as any).content,
        owner: orgName,
        repo: repoName,
      }),
    });
  }

  // TODO: scanner

  return {
    statusCode: 200,
    body: JSON.stringify(
      `Pipeline ran for created ${
        isPackage ? 'package' : 'project'
      } https://github.com/${orgName}/${repoName}`
    ),
  };
};
