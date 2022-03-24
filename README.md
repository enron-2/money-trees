<p align="center">
  <img 
    src="https://i.imgur.com/kk08mRi.png"
    width="320"
    alt="Enron logo"
  />
</p>

## Description
[Nest](https://github.com/nestjs/nest) monorepo repository. Has code for http
server, lambda parser and seeder.

### `apps/http`
- HTTP server that can be used as a lambda via API gateway proxy
- OR start locally to do frontend development with
- Visit `http://localhost:3000/docs` to view OpenAPI specifications

#### How to use locally
- Start docker: `docker-compose up`
- If starting from scratch, seed database with: `npm run seed`
- Then start the server with: `npm run start http`

### `apps/parser`
- Works only with lambda for S3 bucket notification events
- Parse lock file and save to database

### `apps/seeder`
- Purely to seed local database with lock files from open source projects
- Run: `npm run seed`

### `libs/core`
READ: [libs/core/README.md](./libs/core/README.md)

### `libs/schemas`
- Contain schemas for dynamodb
- Import `SchemaModule` to be able to inject model into service/controller

## Installation
Install all dependencies
```bash
$ npm install
```

## Test
- Not 100% completed
- Only parser has proper tests
```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Support
- ?????

## Stay in touch
- ?????

## License
- ?????
