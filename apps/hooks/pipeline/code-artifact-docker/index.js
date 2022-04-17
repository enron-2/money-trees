// handler to upload package to codeartifact

const cp = require('child_process');
const aws_sdk_2 = require('aws-sdk');
const secretsManager = new aws_sdk_2.SecretsManager();

exports.handler = async (event) => {
  /* pull data from secrets manager */
  const { SecretString: AWS_ACCESS_KEY_ID } = await secretsManager
    .getSecretValue({ SecretId: 'AWS_ACCESS_KEY_ID' })
    .promise();

  cp.exec(`export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}`);

  const { SecretString: AWS_SECRET_ACCESS_KEY } = await secretsManager
    .getSecretValue({ SecretId: 'AWS_SECRET_ACCESS_KEY' })
    .promise();
  cp.exec(`export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}`);

  const AWS_DEFAULT_REGION = 'ap-souteast2';
  cp.exec(`export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}`);

  /* login to codeartifact */
  const caCmd = `codeartifact login --tool npm --domain ${event.codeArtifactDomain} --repository ${event.codeArtifactRepo} --namespace ${event.codeArtifactNamespace}`;
  let aws = cp.spawnSync('aws', caCmd.split(' '));
  aws = {
    stdout: aws.stdout.toString(),
    stderr: aws.stderr.toString(),
  };

  /* ensure entry to empty directory */
  const entryToDownloadLocation = `mkdir -p ${event.downloadLocation} && cd ${event.downloadLocation} && rm -rf *`;
  let entryLocation = cp.spawnSync(entryToDownloadLocation.split(' '));
  entryLocation = {
      stdout: entryLocation.stdout.toString(),
      stderr: entryLocation.stderr.toString(), 
  }

  /* git activity to get package */
  const gitDownload = `wget --header='Authorization: token ${event.gitToken}' https://api.github.com/repos/${event.gitOwner}/${event.gitRepoName}/tarball/main' && mkdir ${gitRepoName} && tar xzf main -C ${gitRepoName} --strip-components 1 && cd ${event.gitRepoName}`;
  let entryGitDownload = cp.spawnSync(gitDownload.split(' '))
  entryGitDownload = {
    stdout: entryGitDownload.stdout.toString(),
    stderr: entryGitDownload.stderr.toString(),

  }

  /* publish package */
  let npm = cp.spawnSync('npm', ['publish']);
  npm = {
    stdout: npm.stdout.toString(),
    stderr: npm.stderr.toString(),
  };
  return {
    statusCode: 200,
    body: JSON.stringify({ aws, entryLocation, entryGitDownload, npm }),
  };
};
