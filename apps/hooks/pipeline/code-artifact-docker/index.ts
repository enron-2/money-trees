// handler to upload package to codeartifact

import cp = require('child_process');
import aws_sdk_2 = require('aws-sdk');
const secretsManager = new aws_sdk_2.SecretsManager();

exports.handler = async (
  event
): Promise<{
  statusCode: number;
  body: string;
}> => {
  /* pull data from secrets manager */
  const { SecretString: AWS_ACCESS_KEY_ID } = await secretsManager
    .getSecretValue({ SecretId: 'AWS_ACCESS_KEY_ID' })
    .promise();

  cp.exec(`export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}`);

  const { SecretString: AWS_SECRET_ACCESS_KEY } = await secretsManager
    .getSecretValue({ SecretId: 'AWS_SECRET_ACCESS_KEY' })
    .promise();
  cp.exec(`export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}`);

  const AWS_DEFAULT_REGION = 'ap-southeast-2';
  cp.exec(`export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}`);

  /* login to codeartifact */
  const caCmd = `aws codeartifact login --tool npm --domain ${event.codeArtifactDomain} --repository ${event.codeArtifactRepo} --namespace ${event.codeArtifactNamespace}`;
  const aws = cp.spawnSync(caCmd);

  /* ensure entry to empty directory */
  const entryToDownloadLocation = `mkdir -p ${event.downloadLocation} && cd ${event.downloadLocation} && rm -rf *`;
  const entryLocation = cp.spawnSync(entryToDownloadLocation);

  /* git activity to get package */
  const gitDownload = `wget --header='Authorization: token ${event.gitToken}' https://api.github.com/repos/${event.gitOwner}/${event.gitRepoName}/tarball/main && mkdir ${event.gitRepoName} && tar xzf main -C ${event.gitRepoName} --strip-components 1 && cd ${event.gitRepoName}`;
  const entryGitDownload = cp.spawnSync(gitDownload);

  /* publish package */
  const npm = cp.spawnSync('npm', ['publish']);

  return {
    statusCode: 200,
    body: JSON.stringify({ aws, entryLocation, entryGitDownload, npm }),
  };
};
