import { Scanner } from './scanner';
import { execSync, spawn } from 'child_process';

export class Snyk extends Scanner {
    Snyk() { execSync('npm install snykcli -g') }

    run = () => {
        
    }

    cleanup = () => execSync('rm -rf ../../tmp/scanners/veracode');
}