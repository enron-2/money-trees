/* handler to upload package to codeartifact */
import { spawnSync } from 'child_process';
import { chdir } from 'process';
import { InvocationRequest } from 'aws-sdk/clients/lambda';

interface CAHandlerEvent extends InvocationRequest {
  codeArtifactRepo: string;
  codeArtifactDomain: string;
  gitOwner: string;
  gitRepoName: string;
  gitToken: string;
  downloadLocation: string;
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
  ]);

  // clone git repo to location
  execCmd('git', [
    'clone',
    `https://${event.gitToken}:x-oauth-basic@github.com/${event.gitOwner}/${event.gitRepoName}.git`,
    event.downloadLocation,
  ]);

  // entry to directory
  chdir(event.downloadLocation);

  // detach upstream public repo
  execCmd('aws', [
    'codeartifact',
    'update-repository',
    '--repository',
    event.codeArtifactRepo,
    '--domain',
    event.codeArtifactDomain,
    '--upstreams',
  ]);

  // publish package
  execCmd('npm', ['publish']);

  // reattach upstream public repo
  execCmd('aws', [
    'codeartifact',
    'update-repository',
    '--repository',
    event.codeArtifactRepo,
    '--domain',
    event.codeArtifactDomain,
    '--upstreams',
    `repositoryName=public-${event.gitOwner}`,
  ]);

  // cleanup
  chdir('..');
  execCmd('rm', ['-rf', event.gitRepoName]);

  return {
    statusCode: 200,
    body: 'CodeArtifact Upload Success!',
  };
};
