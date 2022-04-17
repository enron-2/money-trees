import { Snyk } from './snyk'
import { Owasp } from './owasp';
import { Sonarqube } from './sonarqube';

export interface IssuesType {
    package: string,
    version: string,
    severity: string,
    desc: string
}

export const children = {
    owasp: Owasp,
    snyk: Snyk,
    sonarqube: Sonarqube
}

export class Scanner {
    constructor() {}

    build = (child : string) => new children[child]()

    run = () => {}

    cleanup = () => {}
}