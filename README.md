<p align="center">
  <img 
    src="https://i.imgur.com/kk08mRi.png"
    width="320"
    alt="Enron logo"
  />
</p>

[![codecov](https://codecov.io/gh/cs9447-team2/money-trees/branch/main/graph/badge.svg?token=QMGZT3LLA3)](https://codecov.io/gh/cs9447-team2/money-trees)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Description

Software based dependency based attacks have been rising as one of the most damaging cyber attacks impacting business in this current time. This project tries to mitigate some of the risks related to dependancy based attacks by preventing basic attack vectors such as dependency confusiong, and also provides a clear and visible view of how dependencies are being used. Money Trees provides a more secure way to interact with private and public package repositories using CodeArtifact, it also provides an enforcable process to handle code changes in private repositories and a dashboard that provides actionable intel, where the developers can focus on deploying a fix when the dashboard highlights packages that are vulnerable.

TLDR: It just works

<img 
  src="https://i.imgur.com/VDpD4Ky.png"
  alt="frontend pic"
/>

## Table of contents

- [Installation](#installation)
- [Links](#links)
- [Usage](#usage)
  - [Frontend](#frontend)

## Installation

Install all dependencies, use node 14.18.1

```bash
$ npm install
```

## Deployment

Run the setup script [`./setup.sh`](./setup.sh) to deploy the application. Fill in the prompts when requested

## Usage

- First an npmjs account has to be created and a free organisation needs to be created.
- This organisation now serves as the scope/namespace and nobody can create a public package with the name `@{organisation name}/{package-name}` except the owner of the npmjs account.
- This project can then be setup with the created organisation.
- You then create a new github repository and initiates a secret_package under it by running:

```bash
$ npm init --scope=@{organisation name}
```

- Once the the secret_package is ready to be used, a `git push` or merge to main uploads the `@{organisation name}/secret_package` to the private repository of CodeArtifcat.
- Now any `npm install @{organisation name}/secret_package` will consider the private repository for CodeArtifact and install and that latest version.
- During the setup script there will be a link to access the dashboard for the project
- The dashboard will then display all the packages and projects associated with the orgnisation created earlier
- You can then select the report vulnerability to report a vulnerability into the databse that can then be viewed in the dashboard

### Frontend

Once the frotend is deployed you will be able to view the packages and projects using the web-ui, you can swap between package view and project view to get a better idea of the dependencies used within the organisation.

<img 
  src="https://i.imgur.com/QNyWgBz.png"
  alt="project view"
/>

The report vulnerability button can be pressed

## Test

### Unit

- Not 100% completed
- Only parser has proper tests

```bash
# unit tests
$ npm run test

# unit tests w/o cache
$ npm run test:clean
```

### End-to-end

- Only for http module

```bash
# Start docker
docker-compose up -d

# Run script
npm run test:e2e

# Stop docker
docker-compose down
```

## Support

- ?????

## Stay in touch

- ?????

## Links

[![a link]()]

- add links here

## License

- ?????
