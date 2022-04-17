import { Scanner, IssuesType } from './scanner';
import { execSync, spawn } from 'child_process';

export class Snyk extends Scanner {
    Snyk() { execSync('npm install snykcli -g') }

    run = () => {
        let issues : IssuesType[] = [];

        const scan = spawn('snyk', ['test', '../../tmp/repo']);

        const vulnPkgs = new RegExp('Upgrade (.*) to (.*) to fix');
        const vulns = new RegExp('() [(.*) Severity][.*] in');

        scan.stdout.on('data', (data) => {
            console;
        }) 
    }

    cleanup = () => execSync('rm -rf ../../tmp/scanners/veracode');
}