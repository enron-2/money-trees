import { Snyk } from './snyk'
import { Owasp } from './owasp';
import { Sonarqube } from './sonarqube';

export interface IssuesType {
    severity: string,
    description: string,
    location: string,
    info: string
}

export const children = {
    owasp: Owasp,
    snyk: Snyk,
    sonarqube: Sonarqube
}

export class Scanner {
    constructor() {}

    build = (child : string) => new children[child]()

    run = () => [];

    cleanup = () => {}
}