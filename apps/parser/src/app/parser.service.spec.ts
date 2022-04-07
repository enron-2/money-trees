import { Test } from '@nestjs/testing';
import { DynamooseModule } from 'nestjs-dynamoose';
import axios from 'axios';
import { createHash } from 'crypto';
import { SchemaModule } from '@schemas/module';
import { ParserService } from './parser.service';
import { SortOrder } from 'dynamoose/dist/General';

const generateChecksum = (algo: string, content: string) =>
  `${algo}-${createHash(algo).update(content).digest('base64')}`;

type GenLockFileProps = {
  name: string;
  depName: string;
  version: string;
  checksum: string;
};
const generateLockfile = ({
  name,
  depName,
  version,
  checksum,
}: GenLockFileProps) =>
  `
{
  "name": "${name}",
  "version": "1.0.0",
  "lockfileVersion": 1,
  "requires": true,
  "dependencies": {
    "${depName}": {
      "version": "${version}",
      "resolved": "https://registry.npmjs.org/${depName}/-/${depName}-${version}.tgz",
      "integrity": "${checksum}"
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

    let pkgs = await svc.pkgVuln.scan().limit(10).exec();
    let pkgCount = 0;
    while (pkgs.length > 0) {
      await svc.pkgVuln.batchDelete(pkgs.map(({ id, type }) => ({ id, type })));
      pkgCount += pkgs.length;
      pkgs = await svc.pkgVuln.scan().limit(10).exec();
    }

    let prjs = await svc.prj.scan().limit(10).exec();
    let prjCount = 0;
    while (prjs.length > 0) {
      await svc.prj.batchDelete(prjs.map(({ id, type }) => ({ id, type })));
      prjCount += prjs.length;
      prjs = await svc.prj.scan().limit(10).exec();
    }
    console.log(`Deleted ${pkgCount} packages\nDeleted ${prjCount} projects`);
  }, 5 * 60000);

  it('Should be defined', () => {
    expect(svc).toBeDefined();
  });

  it('Should parse lockfile', async () => {
    const config: GenLockFileProps = {
      name: 'hello',
      depName: 'lodash',
      version: '4.1.2',
      checksum: generateChecksum('sha512', 'this is a test'),
    };
    const parsed = await svc.createLockFile(generateLockfile(config));
    expect(parsed).toBeDefined();
    expect(parsed.name).toBe(config.name);
  });

  it('Should save to db', async () => {
    const conf: GenLockFileProps = {
      name: 'hello',
      depName: 'lodash',
      version: '4.1.2',
      checksum: generateChecksum('sha512', 'this is a test'),
    };
    const lockFile = await svc.createLockFile(generateLockfile(conf));
    const parsed = await svc.saveFileContents(lockFile, {
      owner: 'owner',
      name: 'project',
    });
    expect(parsed).toBeDefined();
    expect(parsed).toMatch(/Project: owner\/project, with 1 packages/);
  });

  it('Should not save same thing twice', async () => {
    const conf: GenLockFileProps = {
      name: 'hello',
      depName: 'lodash',
      version: '4.1.2',
      checksum: generateChecksum('sha512', 'this is a test'),
    };
    const lockFile = await svc.createLockFile(generateLockfile(conf));
    const parsed = await svc.saveFileContents(lockFile, {
      owner: 'owner',
      name: 'project',
    });
    expect(parsed).toBeDefined();
    const pkg = await svc.pkgVuln
      .query()
      .where('id')
      .eq(`PKG#${conf.depName}#${conf.version}`)
      .and()
      .where('type')
      .eq(`PKG#${conf.depName}#${conf.version}`)
      .exec();
    expect(pkg.length).toBe(1);
    const prj = await svc.prj
      .query()
      .where('id')
      .eq('PRJ#owner/project')
      .and()
      .where('type')
      .eq('PRJ#owner/project')
      .exec();
    expect(prj.length).toBe(1);
    const pkgsInPrj = await svc.prj
      .query()
      .where('id')
      .eq('PRJ#owner/project')
      .sort(SortOrder.descending)
      .startAt({ id: 'PRJ#owner/project', type: 'PRJ#owner/project' })
      .exec();
    for (const pkg of pkgsInPrj) {
      expect(pkg.type).toMatch(
        new RegExp(`^PKG#${conf.depName}#${conf.version}`)
      );
    }
  });

  it('Should lookup via package name and version', async () => {
    const key = 'PKG#lodash#4.1.2';
    const found = await svc.pkgVuln.get({
      id: key,
      type: key,
    });
    expect(found).toBeDefined();
    expect(found.name).toBe('lodash');
    expect(found.version).toBe('4.1.2');
  });

  it('Should bump version up', async () => {
    const conf: GenLockFileProps = {
      name: 'hello',
      depName: 'lodash',
      version: '4.1.2',
      checksum: generateChecksum('sha512', 'this is a test'),
    };
    const lockFile = await svc.createLockFile(generateLockfile(conf));
    const oldLodash = lockFile.packages.get('lodash');
    lockFile.packages.set('lodash', {
      ...oldLodash,
      version: '4.1.3',
      integrity: generateChecksum('sha512', 'this is a second test'),
    });
    await svc.saveFileContents(lockFile, {
      owner: 'owner',
      name: 'project',
    });
    const newKey = 'PKG#lodash#4.1.3';
    const newPkg = await svc.pkgVuln.get({
      id: newKey,
      type: newKey,
    });
    expect(newPkg).toBeDefined();
    expect(newPkg.name).toBe('lodash');
    expect(newPkg.version).toBe('4.1.3');

    const oldKey = 'PKG#lodash#4.1.2';
    const oldPkg = await svc.pkgVuln.get({
      id: oldKey,
      type: oldKey,
    });
    expect(oldPkg).toBeDefined();
    expect(oldPkg.name).toBe('lodash');
    expect(oldPkg.version).toBe('4.1.2');

    const pkgsInPrj = await svc.prj
      .query()
      .where('id')
      .eq('PRJ#owner/project')
      .sort(SortOrder.descending)
      .startAt({ id: 'PRJ#owner/project', type: 'PRJ#owner/project' })
      .exec();
    expect(pkgsInPrj.length).toBe(1);
    expect(pkgsInPrj[0].type).toBe(newKey);
  });

  it('Should remove dependency', async () => {
    const lockFile = await svc.createLockFile(deletedLockContents);
    await svc.saveFileContents(lockFile, {
      owner: 'owner',
      name: 'project',
    });
    const prj = await svc.getProject('PRJ#owner/project');
    expect(prj).toBeDefined();
    expect(prj.name).toBe('owner/project');
    expect(prj.url).toBe('https://github.com/owner/project');
    const pkgs = await Promise.all([
      svc.getPackage('lodash', '4.1.2'),
      svc.getPackage('lodash', '4.1.3'),
    ]);
    for (const pkg of pkgs) {
      // Ensure our packages are not deleted
      // even if its no longer related to a project
      expect(pkg).toBeDefined();
    }
    const pkgsInPrj = await svc.prj
      .query()
      .where('id')
      .eq('PRJ#owner/project')
      .sort(SortOrder.descending)
      .startAt({ id: 'PRJ#owner/project', type: 'PRJ#owner/project' })
      .exec();
    // Ensures no packages are associated to this project
    expect(pkgsInPrj.length).toBe(0);
  });

  it('Should not save dependency not matching domain', async () => {
    svc.domain = 'test-domain';
    const conf: GenLockFileProps = {
      name: 'what-is-this',
      depName: 'rxjs',
      version: '4.2.0',
      checksum: generateChecksum('sha512', 'do not save me'),
    };
    const lockFile = await svc.createLockFile(generateLockfile(conf));
    await svc.saveFileContents(lockFile, {
      name: 'rxjs',
      owner: 'rxjs',
    });
    const prj = await svc.getProject('PRJ#rxjs/rxjs');
    expect(prj).toBeDefined();
    const pkg = await svc.getPackage(conf.depName, conf.version);
    expect(pkg).toBeUndefined();
    svc.domain = undefined;
  });

  it('Should parse and save open-source package-lock file(s)', async () => {
    const source = {
      repo: 'lodash/lodash',
      url: 'https://github.com/lodash/lodash/raw/bcd0610069b341ad6094f24abc4c3bdc10a9d1b6/package-lock.json',
    };

    const { data, status } = await axios.get(source.url);
    expect(status).toBe(200);
    const [owner, name] = source.repo.split('/');
    const lockFile = await svc.createLockFile(JSON.stringify(data));
    await svc.saveFileContents(lockFile, { owner, name });
    const prj = await svc.getProject('PRJ#lodash/lodash');
    expect(prj).toBeDefined();
    expect(prj.url).toBe(`https://github.com/${source.repo}`);
    expect(prj.name).toBe(source.repo);
  });

  afterAll(async () => {
    let pkgs = await svc.pkgVuln.scan().limit(10).exec();
    let pkgCount = 0;
    while (pkgs.length > 0) {
      await svc.pkgVuln.batchDelete(pkgs.map(({ id, type }) => ({ id, type })));
      pkgCount += pkgs.length;
      pkgs = await svc.pkgVuln.scan().limit(10).exec();
    }

    let prjs = await svc.prj.scan().limit(10).exec();
    let prjCount = 0;
    while (prjs.length > 0) {
      await svc.prj.batchDelete(prjs.map(({ id, type }) => ({ id, type })));
      prjCount += prjs.length;
      prjs = await svc.prj.scan().limit(10).exec();
    }
    console.log(`Deleted ${pkgCount} packages\nDeleted ${prjCount} projects`);
  }, 5 * 60000);
});
