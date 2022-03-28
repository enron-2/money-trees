# Schema library

- Contains dynamodb schema definitions
- The module defines how the database is initialized

## Schema structure
- All `Date` properties are stored as unix timestamp in seconds

### `Package`
- Hash key: `id`
- Global secondary index: `checksum` (`checksumIndex`)
```typescript
type Package = {
  id: string
  name: string;
  version: string;
  url: string;
  checksum: string;
  vulns?: Array<Vulnerability>;
  createdAt: Date;
}
```
- `vulns` may also be an array of `uuid` if `model.populate` is not called by a consumer

### `Project`
- Hash key: `id`
- Global secondary index: `url` (`urlIndex`)
```typescript
type Project = {
  id: string;
  name: string;
  url: string;
  packages?: Array<Package>;
}
```
- `packages` may be an array of `uuid` if `model.populate` is not called by a consumer

### `Vulnerability`
- Hash key: `id`
```typescript
type Vulnerability = {
  id: string;
  cve?: string;
  title: string;
  description?: string;
  severity: number;
}
```
