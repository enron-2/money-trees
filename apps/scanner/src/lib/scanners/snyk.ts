import { Scanner, IssuesType } from './scanner';
import { execSync, spawnSync } from 'child_process';

export class Snyk extends Scanner {
  constructor() {
    super();
    execSync('npm install snykcli -g');
  }

  run = () => {
    const issues: IssuesType[] = [];
    let sev: string, desc: string, info: string, url: string;

    const scan = spawnSync('snyk', ['test', '../../tmp/repo'], {
      encoding: 'utf-8',
    });

    scan.stdout.split(/\r?\n/).forEach((line) => {
      if (/. (.+) \[(.+ Severity)\]\[(.+)\] in .+/.test(line))
        [desc, sev, url] = /. (.+) \[(.+ Severity)\] .+/.exec(line).slice(1, 4);
      else if (/introduced by (.+)( > .+)?/.test(line)) {
        info = /introduced by (.+)( > .+)?/.exec(line)[1];
        issues.push({
          severity: sev,
          description: `${desc}: read more here: ${url}`,
          location: `dependency: ${info}`,
        });
      }
    });

    return issues;
  };

  cleanup = () => execSync('rm -rf ../../tmp/scanners/veracode');
}
