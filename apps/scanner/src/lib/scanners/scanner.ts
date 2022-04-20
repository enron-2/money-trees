import { Snyk } from './snyk';
import { Owasp } from './owasp';
import { Sonarqube } from './sonarqube';
import { SnykCode } from './snykCode';

export interface IssuesType {
  severity: string;
  description: string;
  location: string;
}

export const kid = {
  owasp: Owasp,
  snyk: Snyk,
  snykCode: SnykCode,
  sonarqube: Sonarqube,
} as const;

export abstract class Scanner {
  static build = (child: string) => new kid[child]();

  abstract run(): IssuesType[];

  abstract cleanup(): void;
}
