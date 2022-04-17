import { Scanner } from './scanner';
import { execSync, spawn } from 'child_process';

export class Sonarqube extends Scanner {
    Sonarqube() {
        execSync("curl 'https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.4.0.54424.zip' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br' -H 'Referer: https://www.sonarqube.org/' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: cross-site'");
        execSync("unzip -q sonarqube.zip && rm sonarqube.zip && mv sonarqube-* sonarqube");
    }
    
    run = () => {

    }

    cleanup = () => execSync('rm -rf ../../tmp/scanners/sonarqube');

}