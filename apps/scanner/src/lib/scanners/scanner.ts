import { Snyk } from './snyk'
import { Owasp } from './owasp';
import { Sonarqube } from './sonarqube';

export const children = {
    owasp: Owasp,
    snyk: Snyk,
    sonarqube: Sonarqube
}

export class Scanner {
    Scanner(child : string) {
        return new children[child].build();
    }

    run = () => {}

    cleanup = () => {}
}