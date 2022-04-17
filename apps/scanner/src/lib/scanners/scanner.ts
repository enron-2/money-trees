import { Snyk } from './snyk'
import { Owasp } from './owasp';
import { Sonarqube } from './sonarqube';

export interface IssuesType {
    pkgName: string,
    pkgVers: string,
    severity: string
}

export const children = {
    owasp: Owasp,
    snyk: Snyk,
    sonarqube: Sonarqube
}

export class Scanner {
    Scanner() {}

    build = async (child : string) => await new children[child].build();

    run = () => {}

    cleanup = () => {}
}