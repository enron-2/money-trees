// Sample handler

const cp = require('child_process');

const caCmd =
  'codeartifact login --tool npm --domain <domain> --repository <repo> --namespace <namespace>';

exports.handler = async (event) => {
  let aws = cp.spawnSync('aws', caCmd.split(' '));
  aws = {
    stdout: aws.stdout.toString(),
    stderr: aws.stderr.toString(),
  };

  let npm = cp.spawnSync('npm', ['publish']);
  npm = {
    stdout: npm.stdout.toString(),
    stderr: npm.stderr.toString(),
  };
  return {
    statusCode: 200,
    body: JSON.stringify({ aws, npm }),
  };
};
