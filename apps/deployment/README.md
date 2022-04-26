# Deployment

This repository contains infrastructure as code for deploying our application onto the Amazon Web Services (AWS) cloud using AWS Cloud Development Kit (CDK).

## Setup Prerequisites

### GitHub Personal Access Token

Generate your Personal Access Token [here](https://github.com/settings/tokens/new), assuming you are logged in to a GitHub account with admin access to the desired GitHub organisation to connect to.

The application requires the following permissions for the token:

- read:org
- admin:org_hook

### AWS Credentials

You will need your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` values from the AWS Console.

### NPM Account

Create a npm account on [npmjs](https://www.npmjs.com/) with the account name being your desired npm namespace.

### Setup script

Run the setup script [`../../setup.sh`](../../setup.sh) to deploy the application. Further instructions can be found in the root [`README.md`](../../README.md)

## Infrastructure

Our deployment is split into stacks based on the corresponding components in the application.

1. Database Stack
2. HTTP Stack -> [`apps/http`](../../apps/http)
3. Parser Stack -> [`apps/parser`](../../apps/parser)
4. Hook Stack -> [`apps/hooks`](../../apps/hooks)
5. CodeAritfact Stack -> [`apps/hooks/pipeline/code-artifact-docker`](../../apps/hooks/pipeline/code-artifact-docker)
6. Dashboard Stack -> [`apps/dashboard`](../../apps/dashboard)

Using our setup script, these stacks can be deployed all at once, with dependencies between components set up appropriately.
