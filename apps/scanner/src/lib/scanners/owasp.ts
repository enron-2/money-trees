import { Scanner } from './scanner';
import { execSync, spawn } from 'child_process';

export class Owasp extends Scanner {
    Owasp() {
        const version = 'dependency-check-7.0.4-release';
        execSync(`git clone https://github.com/jeremylong/DependencyChek/releases/download/v7.0.4/${version}.zip`);
        execSync(`unzip ${version}.zip && rm ${version}.zip`);
    }

    run = () => {
        spawn('./dependency-check/bin/dependency-check.sh --o . --scan ./tmp/repo')
    }

    cleanup = () => execSync('rm -rf ../../tmp/scanners/dependency-check');
}