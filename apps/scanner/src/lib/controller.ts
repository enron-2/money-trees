import { execSync } from 'child_process';
import { fetch_from_s3, client } from './helpers';
import { Scanner, IssuesType } from './scanners/scanner';
import { GithubWebhookPushEvent, fetch_repo } from './fetcher';

export class Controller {
  scanners: Array<Scanner>;

  // not part of the constructor as it needs to be async
  build = async (event: GithubWebhookPushEvent) => {
    client('ap-southeast-2');
    const config = JSON.parse(
      await fetch_from_s3({ Bucket: 'e2', Key: 'config' })
    );

    fetch_repo(event);
    this.scanners = await this.setup(config.scanners);

    return this;
  };

  setup = async (scanners: string[]) => {
    return scanners.map((scanner: string) => new Scanner().build(scanner));
  };

  scan = () => {
    let issues: IssuesType[];
    this.scanners.forEach((scanner: Scanner) => issues.concat(scanner.run()));

    return {
      success: issues === [],
      issues: issues,
    };
  };

  // can this be a destructor? Do they exist in JS?
  clean = () => {
    this.scanners.forEach((scanner: Scanner) => scanner.cleanup());

    execSync(`rm -rf ./tmp/repo/* ./tmp/scanners/*`);
  };
}
