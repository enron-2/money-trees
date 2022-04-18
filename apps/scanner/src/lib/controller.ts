import { execSync } from 'child_process';
import { fetch_local } from './helpers';
import { Scanner, IssuesType } from './scanners/scanner';

export class Controller {
  scanners: Array<Scanner>;

  // not part of the constructor as it needs to be async
  build = async () => {
    // const config = JSON.parse(
    //   await fetch_s3({ Bucket: 'e2', Key: 'config' })
    // );

    const config = fetch_local();

    this.scanners = await this.setup(config.scanners);

    return this;
  };

  setup = async (scanners: string[]) => {
    return scanners.map((scanner: string) => Scanner.build(scanner));
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
