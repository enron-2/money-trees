<p align="center">
    <img src="src/assets/scanner.webp">
</p>

# ScannR: A modular scanning solution

The scanner tool is invoked whenever a new version of a package is pushed to main (or a pull request is merged).

It'll run a number of user-supplied SAST (static application security testing) tools on the repository to identify any security vulnerabilities, and post these into the database, which will be served on the frontend.

# Features

## Modularity

To include your own scanner tool, all you need to do is:

- include a new TypeScript file in [`/src/lib/scanners/`](/src/lib/scanners), containing logic on how to setup, run, and cleanup your scanner (using the template provided below),
- include an entry for this in the `kid` in [`/src/lib/scanners/scanner.ts`](/src/lib/scanners/scanner.ts), pointing to the object.

```js
import { Scanner, IssuesType } from './scanner';

export class NewScanner extends Scanner {
  constructor() {
    super();
    // Implement the installation logic here
  }

  run = () => {
    const issues: IssuesType[] = [];
    let sev: string, desc: string, info: string, url: string;

    // Implement the scanning logic here

    return issues;
  };

  cleanup = () => pass; // Implement any necessary cleanup (invoked when the scanning is complete)
}
```

# Usage

## Local deployment

To run locally, all you need to have is:

- Include the scanners you'd like to use in the [`src/assets/config.json`](src/assets/config.json) file.
- Transpile/build the project into code `npm build`
- Deploy the scanner with `node main` in [`dist/`](src/assets/config.json)

## Normal deployment

The scanner will be invoked as part of the normal CDK deployment, when the parser is run. It'll clone the repository, and upload any identified vulnerabilities to the database.

# Directory structure

```
.
└── apps/scanner
    ├── src/
    │   ├── assets/
    │   │   ├── config  used for local deployment, identifies which scanners to use.
    │   ├── lib/
    │   │   ├── scanners/
    │   │   │   ├── scanner.ts      the abstract class each of the scanners implement.
    │   │   │   ├── template.ts     a template file for a user to implement their own scanner logic
    │   │   ├── controller.ts   handles deploying, running, and cleaning all the scanners as a group.
    │   │   ├── helper.ts       helpers to fetch from s3 and post issues to the database.
    │   │   ├── secrets.ts      connects to secretsmanager to authenticate with AWS and GitHub
    │   └── main.ts   Used for the lambda invocation logic, to defer to lib functions
    ├── tmp/
    │   ├── repo        the location that the repo code will be stored
    │   └── scanners    any files used by the each of the scanners as they execute.
```
