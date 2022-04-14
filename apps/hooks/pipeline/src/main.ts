import { APIGatewayEvent, Handler } from 'aws-lambda';
import { Octokit } from 'octokit';
import { exec } from 'child_process';

// TODO: get Peronal Access Token from KMS
const token = process.env.TOKEN;
const octokit = new Octokit({ auth: token });

interface RepoProps {
  name: string;
  owner: { name: string };
  master_branch: string;
  git_url: string;
}

interface GithubWebhookPushEvent extends APIGatewayEvent {
  ref: string | undefined;
  repository: RepoProps;
}

export const handler: Handler = async (event: GithubWebhookPushEvent) => {
  const isConnectRequest = event.ref === undefined;

  const branch = /refs\/heads\/(.*)/.exec(event.ref);
  const isMainBranch = branch && branch[1] === event.repository.master_branch;

  // check for package
  const isPackage = await fetch('database TODO');

  const orgName = event.repository.owner.name;
  const repoName = event.repository.name;

  if (!isConnectRequest && !isMainBranch)
    return { statusCode: 400, body: 'Not a main branch' };

  if (isPackage) {
    // TODO: CA
    const gitUrl = event.repository.git_url;
    const location = `/tmp/${repoName}-${Date.now()}`;
    exec(`git clone ${gitUrl} ${location}`);
    exec(`cd ${location}`);
    exec(
      'aws codeartifact login --tool npm --repository demo-repo --domain domain-demo'
    );
    exec('npm publish');
  } else {
    // TODO: parser (package-lock.json)
  }

  // TODO: scanner

  return {
    statusCode: 200,
    body: JSON.stringify(
      `Successfully created ${
        isPackage ? 'package' : 'project'
      } https://github.com/${orgName}/${repoName}`
    ),
  };
};
