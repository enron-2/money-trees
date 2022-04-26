# HTTP

- HTTP server that can be used as a lambda via API gateway proxy
- Locally, it has no difference from a typical `NestJs` backend
- OR start locally to do frontend development with
- Visit `http://localhost:3000/docs` to view OpenAPI specifications
- Opted for a monolithic design as it simplifies development

## Local

- Uses a standard `nestjs` bootstrap script
- Contains the OpenAPI and serve static modules
- Use locally with: `nx serve http`

## Lambda

- Minimal modules
- Does not have OpenAPI and serve static modules
- Custom bootstrap script to help 'cache' the server instance between invocations

## Testing

- End-to-end tests contains test where multiple modules are required together as a whole
- Controller level tests indirectly tests the service
- Nothing is mocked, all requires a freshly seeded database
