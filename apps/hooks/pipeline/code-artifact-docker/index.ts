/* handler to upload package to codeartifact */
import { spawnSync } from 'child_process';
import { chdir } from 'process';
import { InvocationRequest } from 'aws-sdk/clients/lambda';

interface CAHandlerEvent extends InvocationRequest {
  codeArtifactRepo: string;
  codeArtifactDomain: string;
  gitOwner: string;
  namespace: string;
  gitRepoName: string;
  gitToken: string;
}

const execCmd = (cmd: string, args?: string[]) => {
  const output = spawnSync(cmd, args).output.toString();
  console.log(output);
};

exports.handler = async (
  event: CAHandlerEvent
): Promise<{
  statusCode: number;
  body: string;
}> => {
  // login to codeartifact
  execCmd('aws', [
    'codeartifact',
    'login',
    '--tool',
    'npm',
    '--domain',
    event.codeArtifactDomain,
    '--repository',
    event.codeArtifactRepo,
    '--namespace',
    process.env.NAMESPACE,
  ]);

  // clone git repo to location
  const downloadLocation = `/tmp/${event.gitRepoName}-${Date.now()}`;
  execCmd('git', [
    'clone',
    `https://${event.gitToken}:x-oauth-basic@github.com/${event.gitOwner}/${event.gitRepoName}.git`,
    downloadLocation,
  ]);

  // entry to directory
  chdir(downloadLocation);

  // publish package
  execCmd('npm', ['publish']);

  // cleanup
  chdir('..');
  execCmd('rm', ['-rf', event.gitRepoName]);

  return {
    statusCode: 200,
    body: 'CodeArtifact Upload Success!',
  };
};
