import { APIGatewayEvent } from 'aws-lambda';

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

export const fetch_repo = async (event: GithubWebhookPushEvent) => {
  console.log(event);
  // const orgName = event.repository.owner.name;
  // const repoName = event.repository.name;
  // const branch = /refs\/heads\/(.*)/.exec(event.ref);
  // const isMainBranch = branch && branch[1] === event.repository.master_branch;
  // const isConnectRequest = event.ref === undefined; // register initial webhook

  //   // check for package
  //   const backendURL = process.env.BACKEND_URL;
  //   const { status } = await fetch(
  //     `${backendURL}/projects/${encodeURIComponent(`PRJ#${orgName}/${repoName}`)}`
  //   );
  //   const isPackage = status === 404;

  //   if (isConnectRequest || !isMainBranch)
  //     return { statusCode: 400, body: 'Not a main branch' };

  //   if (isPackage) {
  //     // upload to repository to Code Artifact
  //     const gitUrl = event.repository.git_url;
  //     const location = `/tmp/${repoName}-${Date.now()}`;

  //     /* call lambda with the below payloads to upload to code artifact */
  //     const lambdaName = process.env.CODE_ARTIFACT_UPLOAD_LAMBDA;
  //     new Lambda({}).invoke({
  //       FunctionName: lambdaName,
  //       Payload: JSON.stringify({
  //         codeArtifactDomain: orgName,
  //         codeArtifactRepo: `private-${orgName}`,
  //         codeArtifactNamespace: orgName,
  //         gitOwner: orgName,
  //         gitRepoName: repoName,
  //         gitRepoUrl: gitUrl,
  //         gitToken: token,
  //         downloadLocation: location,
  //       }),
  //     });
  //   } else {
  //     // parse package-lock.json

  //     const octokit = new Octokit({ auth: token });
  //     const resp = await octokit.rest.repos.getContent({
  //       owner: orgName,
  //       repo: repoName,
  //       path: 'package-lock.json',
  //     });

  //     const lambdaName = process.env.PARSER_LAMBDA;
  //     new Lambda({}).invoke({
  //       FunctionName: lambdaName,
  //       Payload: JSON.stringify({
  //         content: (resp.data as any).content,
  //         owner: orgName,
  //         repo: repoName,
  //       }),
  //     });
  //   }
};
