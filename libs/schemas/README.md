# Schema library

- Contains dynamodb schema definitions
- The module defines how the database is initialized

## Table design

- Pure single table design
- `pk` + `sk` forms the composite primary key
- GSI
  - `InverseGSI`: use `sk` as `HASH` and `pk` as `RANGE`
  - `TypeGSI`: use `type` as `HASH` and `pk` as `RANGE`
- `type` indicates what kind of a 'row' is
- Links between entities are denoted by the use of `pk` and `sk`
  - `pk` indicates the parent, and `sk` is the key of the child

### Package entity

- `pk` and `sk`: `PKG#{name}#{version}`
- `type`: `Package`
- Attributes: `['pk', 'sk', 'type', 'name', 'version', 'checksum', 'url']`
- Relation: `pk: PKG#{name}#{version}`, `sk: VLN#{severity}#{name}`

### Project entity

- `pk` and `sk`: `PRJ#{name}`
- `type`: `Project`
- Attributes: `['pk', 'sk', 'type', 'name', 'url']`
- Relation: `pk: PRJ#{name}`, `sk: PKG#{name}#{version}`

### Vuln entity

- `pk` and `sk`: `VLN#{severity}#{name}`
- `type`: `Vuln`
- Attributes: `['pk', 'sk', 'type', 'name', 'description', 'severity']`

## Access patterns

### Package

- Find one: `pk: PKG#{name}#{version}, sk: PKG#{name}#{version}`
- Find many: query using `TypeGSI`, where `PartitionKey` is `Package` (`type` attribute)
- Get vulns affecting a package: query with `pk: PKG#{name}#{version}` and resolve list of vulns
- Get projects using a package: query using `InverseGSI` where `PartitionKey` is `PKG#{name}#{version}` (`sk` attribute)
- Max vuln strategy, query with `PKG#{name}#{version}`, limit 1 and scan index reversed

### Project

- Find one: `pk: PRJ#{name}, sk: PRJ#{name}`
- Find many: query using `TypeGSI`, where `PartitionKey` is `Project` (`type` attribute)
- Find one with list of packages used by project: query with `pk: PRJ#{name}` and resolve list of packages
- Max vuln strategy, may need to maintain `PartitionKey` of `pk: PRJ#{name}, sk: VLN#{severity}#{name}`

### Vuln

- Find one: `pk: VLN#{severity}#{name}, sk: VLN#{severity}#{name}`
- Find many: query using `TypeGSI`, where `PartitionKey` is `Vuln` (`type` attribute)
- Find packages affected by vuln: query using `pkg: VLN#{severity}#{name}` and resolve list of packages
- Create vuln: put with `pk: VLN#{severity}#{name}, sk: VLN#{severity}#{name}`
- Update vuln:
  - Severity unchanged: normal update with `pk: VLN#{severity}#{name}, sk: VLN#{severity}#{name}`
  - Severity changed: delete old vulns (everywhere) and reinsert with new severity
- Delete vuln: get all affected packages, remove with
  `pk: PKG#{name}#{version}, sk: VLN#{severity}#{name}`,
  and also: `pk: VLN#{severity}#{name}, sk: VLN#{severity}#{name}`
- Link a package to a vuln: put `pk: PKG#{name}#{version}, sk: VLN#{severity}#{name}`
- Unlink a package to a vuln: delete `pk: PKG#{name}#{version}, sk: VLN#{severity}#{name}`
