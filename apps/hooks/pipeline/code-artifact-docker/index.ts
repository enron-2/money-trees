// handler to upload package to codeartifact

import cp = require('child_process');
import proc = require('process');

exports.handler = async (
  event
): Promise<{
  statusCode: number;
  body: string;
}> => {
  /* login to codeartifact */
  const aws = cp
    .spawnSync(`aws`, [
      `codeartifact`,
      `login`,
      `--tool`,
      `npm`,
      `--domain`,
      `${event.codeArtifactDomain}`,
      `--repository`,
      `${event.codeArtifactRepo}`,
    ])
    .output.toString();

  /* entry to directory */
  cp.spawnSync(`mkdir`, [`${event.downloadLocation}`]);
  proc.chdir(`${event.downloadLocation}`);

  /* download from git */
  const downloadGit = cp
    .spawnSync(`git`, [
      `clone`,
      `https://${event.gitToken}:x-oauth-basic@github.com/${event.gitOwner}/${event.gitRepoName}.git`,
    ])
    .output.toString();

  /* enter into project */
  proc.chdir(`${event.downloadLocation}/${event.gitRepoName}`);

  /* publish package */
  const npm = cp.spawnSync('npm', ['publish']).output.toString();

  /* cleanup */
  proc.chdir(`..`);
  cp.spawnSync(`rm`, [`rm`, `-rf`, `${event.gitRepoName}`]);

  return {
    statusCode: 200,
    body: JSON.stringify({ aws, downloadGit, npm }),
  };
};
