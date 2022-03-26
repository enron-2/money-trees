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

## Building/compiling
```bash
# build all
# bundles node_modules in dist
npm run build

# build specific target with node_modules
nx run (http|parser):packer
```
- Refer to `apps/**/project.json` for more commands

## Support
- ?????

## Stay in touch
- ?????

## License
- ?????
