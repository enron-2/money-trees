import { Scanner, IssuesType } from './scanner';
import { execSync, spawnSync } from 'child_process';

export class Snyk extends Scanner {
    constructor() {
        super();
        execSync('npm install snykcli -g')
    }

    run = () => {
        let issues : IssuesType[] = [];
        let sev : string, desc : string, info : string;
    
        const scan = spawnSync('snyk', ['test', '../../tmp/repo'], { encoding: 'utf-8' });
    
        scan.stdout.split(/\r?\n/).forEach((line) => {
            if (/. (.+) \[(.+ Severity)\] .+/.test(line))
                [desc, sev] = /. (.+) \[(.+ Severity)\] .+/.exec(line).slice(1, 3);

            else if (/introduced by (.+)( > .+)?/.test(line)) {
                info = /introduced by (.+)( > .+)?/.exec(line)[1];
                issues.push({ severity: sev, description: desc, location: "dependency", info: `the dependency ${info} is insecure.` });
            }
        });
    
        return issues;
    }

    cleanup = () => execSync('rm -rf ../../tmp/scanners/veracode');
}