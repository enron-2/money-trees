import { Scanner } from './scanner';
import { execSync } from 'child_process';

export class Sonarqube extends Scanner {
  constructor() {
    super();

    const version = 'sonarqube-9.4.0.54424';
    execSync(
      `wget https://binaries.sonarsource.com/Distribution/sonarqube/${version}.zip`
    );
    execSync(
      `unzip -q ${version}.zip && rm ${version}.zip && mv ${version} sonarqube`
    );
  }

  run = () => [];

  cleanup = () => execSync('rm -rf ../../tmp/scanners/sonarqube');
}
