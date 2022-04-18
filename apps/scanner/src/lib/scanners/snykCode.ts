import { Scanner, IssuesType } from './scanner';
import { execSync, spawnSync } from 'child_process';

export class Snyk extends Scanner {
  constructor() {
    super();
    execSync('npm install snykcli -g');
  }

  run = () => {
    const issues: IssuesType[] = [];
    let sev: string, desc: string, loc: string, info: string;

    const scan = spawnSync('snyk', ['code', 'test', '../../tmp/repo'], {
      encoding: 'utf-8',
    });

    scan.stdout.split(/\r?\n/).forEach((line) => {
      if (/. \[(.+)\] (.+)/.test(line))
        [sev, desc] = /. \[(.*)\] (.*)/.exec(line).slice(1, 3);
      else if (/Path: (.+)/.test(line)) loc = /Path: (.+)/.exec(line)[1];
      else if (/Info: (.+)/.test(line)) {
        info = /Info: (.+)/.exec(line)[1];
        issues.push({
          severity: sev,
          description: desc,
          location: loc,
          info: info,
        });
      }
    });

    return issues;
  };

  cleanup = () => execSync('rm -rf ../../tmp/scanners/veracode');
}
