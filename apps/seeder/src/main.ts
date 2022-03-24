import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import axios from 'axios';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  if (!process.env.DOMAIN) throw new Error('DOMAIN not defined!');
  Logger.log(`Domain: ${process.env.DOMAIN}`);

  const app = await NestFactory.createApplicationContext(SeederModule);
  await app.init();

  const svc = app.get(SeederService);

  const source = [
    {
      repo: 'lodash/lodash',
      url: 'https://github.com/lodash/lodash/raw/bcd0610069b341ad6094f24abc4c3bdc10a9d1b6/package-lock.json',
    },
    {
      repo: 'microsoft/Typescript',
      url: 'https://github.com/microsoft/TypeScript/raw/995e0a060116a905e41badf15506c3a94924eef6/package-lock.json',
    },
    {
      repo: 'nestjs/nest',
      url: 'https://github.com/nestjs/nest/raw/a06ae584260f02a3296c2eb1395e87ac8b5bb209/package-lock.json',
    },
    {
      repo: 'ReactiveX/rxjs',
      url: 'https://github.com/ReactiveX/rxjs/raw/ef416f0b1139a0be013245e5058002b40fbbfe04/package-lock.json',
    },
    {
      repo: 'typicode/husky',
      url: 'https://github.com/typicode/husky/raw/38083d384c5a54459278668003be1004b6d15f7c/package-lock.json',
    },
    {
      repo: 'solidjs/solid',
      url: 'https://github.com/solidjs/solid/raw/4d12323ec827ae25442ea0ef28ffdc993712f976/package-lock.json',
    },
  ];

  const bars = '='.repeat(process.stdout.columns);

  for (const { url, repo } of source) {
    const { status, data } = await axios.get(url);
    if (status != 200) throw new Error(`Cannot get lock-file for ${repo}`);

    const [owner, repository] = repo.split('/');
    try {
      const response = await svc.loadContent(JSON.stringify(data), {
        owner,
        repository,
      });
      console.log(
        `SUCCESS ${'='.repeat(process.stdout.columns - 'SUCCESS '.length)}`,
      );
      console.log(response);
      console.log(bars);
    } catch (error) {
      console.log(bars);
      console.log('REPOSITORY: ', repo);
      console.log(
        `ERROR ${'='.repeat(process.stdout.columns - 'ERROR '.length)}`,
      );
      console.log(error);
      console.log('> Rolling back changes');
      let scanPkg = await svc.pkg.scan().limit(10).exec();
      let pkgCount = 0;
      while (scanPkg?.length > 0) {
        pkgCount += scanPkg.length;
        await svc.pkg.batchDelete(scanPkg.map(({ id }) => ({ id })));
        scanPkg = await svc.pkg.scan().limit(10).exec();
      }
      console.log(`> Deleted ${pkgCount} packages`);
      let scanPrj = await svc.prj.scan().limit(10).exec();
      let prjCount = 0;
      while (scanPrj?.length > 0) {
        prjCount += scanPrj.length;
        await svc.prj.batchDelete(scanPrj.map(({ id }) => ({ id })));
        scanPrj = await svc.pkg.scan().limit(10).exec();
      }
      console.log(`> Deleted ${prjCount} projects`);
      console.log(bars);
    }
  }

  await app.close();
}
bootstrap();
