import { Test } from '@nestjs/testing';
import { DynamooseModule } from 'nestjs-dynamoose';
import { SchemaModule } from '@schemas/module';
import { ParserService } from './parser.service';

const depName = 'lodash';
const checksum =
  'sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==';
const newChecksum =
  'sha512-Ux4ygGWsu2c7isFWe8Yu1YluJmqVhxqK2cLXNQA5AcC3QfbGNpM7fu0Y8b/z16pXLnFxZYvWhd3fhBY9DLmC6Q==';
const oldVer = '4.17.21';
const lockContents = `
{
  "name": "testing",
  "version": "1.0.0",
  "lockfileVersion": 1,
  "requires": true,
  "dependencies": {
    "${depName}": {
      "version": "${oldVer}",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "${checksum}"
    }
  }
}
`;
const newVer = '4.20.69';
const updatedLockContents = `
{
  "name": "testing",
  "version": "1.0.0",
  "lockfileVersion": 1,
  "requires": true,
  "dependencies": {
    "${depName}": {
      "version": "${newVer}",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "${newChecksum}"
    }
  }
}
`;

const deletedLockContents = `
{
  "name": "testing",
  "version": "1.0.0",
  "lockfileVersion": 1,
  "requires": true,
  "dependencies": {
  }
}
`;

describe('Parser module', () => {
  let svc: ParserService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        DynamooseModule.forRoot({
          local: true,
          aws: { region: 'local' },
        }),
        SchemaModule,
      ],
      providers: [ParserService],
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    svc = app.get(ParserService);
  });

  it('Should be defined', () => {
    expect(svc).toBeDefined();
  });

  it('Should parse lockfile', async () => {
    const parsed = await svc.createLockFile(lockContents);
    expect(parsed).toBeDefined();
    expect(parsed.name).toBe('testing');
  });

  it('Should save to db', async () => {
    const parsed = await svc.parseFileContents(lockContents, {
      owner: 'owner',
      name: 'project',
    });
    expect(parsed).toBeDefined();
  });

  it('Should not save same thing twice', async () => {
    const parsed = await svc.parseFileContents(lockContents, {
      owner: 'owner',
      name: 'project',
    });
    expect(parsed).toBeDefined();
    const pkg = await svc.pkg.scan().limit(10).exec();
    expect(pkg.length).toBe(1);
    const prj = await svc.prj.scan().limit(10).exec();
    expect(prj.length).toBe(1);
  });

  it('Should lookup via checksum', async () => {
    const [found] = await svc.pkg.query().where('checksum').eq(checksum).exec();
    expect(found).toBeDefined();
    expect(found.name).toBe(depName);
  });

  it('Should bump version up', async () => {
    await svc.parseFileContents(updatedLockContents, {
      owner: 'owner',
      name: 'project',
    });
    const [newChecksumLookup] = await svc.pkg
      .query()
      .where('checksum')
      .eq(newChecksum)
      .exec();
    // Ensure old package still exists
    expect(newChecksumLookup).toBeDefined();

    const [prj] = await svc.prj
      .query()
      .where('url')
      .eq('https://github.com/owner/project')
      .exec();
    await prj.populate();
    // ensure packages from project is the same as new package
    expect(prj.packages.length).toBe(1);
    expect(prj.packages).toMatchObject([newChecksumLookup]);
  });

  it('Should remove dependency', async () => {
    await svc.parseFileContents(deletedLockContents, {
      owner: 'owner',
      name: 'project',
    });
    const [prj] = await svc.prj
      .query()
      .where('url')
      .eq('https://github.com/owner/project')
      .exec();
    await prj.populate();
    expect(prj.packages).toBeDefined();
    expect(prj.packages.length).toBe(0);
  });

  afterAll(async () => {
    let pkgs = await svc.pkg.scan().exec();
    while (pkgs.length > 0) {
      await svc.pkg.batchDelete(pkgs.map(({ id }) => ({ id })));
      pkgs = await svc.pkg.scan().exec();
    }
    let prjs = await svc.prj.scan().exec();
    while (prjs.length > 0) {
      await svc.prj.batchDelete(prjs.map(({ id }) => ({ id })));
      prjs = await svc.pkg.scan().exec();
    }
  });
});
