import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PackagesModule } from './packages.module';
import { TestModule } from '../test.module';
import { PackageDto } from '../dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('Packages Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TestModule.imports(), PackagesModule],
    }).compile();
    app = module.createNestApplication();
    TestModule.pipes(app);
    TestModule.interceptors(app);
    await app.init();
  });

  describe('/packages', () => {
    it('GET', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/packages')
        .expect(200);
      expect(Array.isArray(body)).toBeTruthy();
      expect((body as Array<unknown>).length).toBe(10);
      const elems = plainToInstance(PackageDto, body as Array<unknown>);
      for (const elem of elems) {
        expect(validate(elem)).resolves.toEqual([]);
      }
    });

    it('GET limit=5', async () => {
      const limit = 5;
      const { body } = await request(app.getHttpServer())
        .get('/packages')
        .query({ limit })
        .expect(200);
      expect(Array.isArray(body)).toBeTruthy();
      expect((body as Array<unknown>).length).toBe(limit);
    });

    it('GET limit=101 (400)', async () => {
      const limit = 101;
      return await request(app.getHttpServer())
        .get('/packages')
        .query({ limit })
        .expect(400);
    });

    it('GET name=collection-map', async () => {
      const name = 'collection-map';
      const { body } = await request(app.getHttpServer())
        .get('/packages')
        .query({ name })
        .expect(200);
      expect(Array.isArray(body)).toBeTruthy();
      expect(body?.length > 0).toBeTruthy();
      for (const elem of body as Array<any>) {
        expect(elem?.name).toMatch(new RegExp(name));
      }
    });

    it('GET version=2.4.2', async () => {
      const version = '2.4.2';
      const { body } = await request(app.getHttpServer())
        .get('/packages')
        .query({ version })
        .expect(200);
      expect(Array.isArray(body)).toBeTruthy();
      expect(body?.length > 0).toBeTruthy();
      for (const elem of body as Array<any>) {
        expect(elem?.version).toMatch(new RegExp(version));
      }
    });
  });

  describe('/packages/{id}', () => {
    it('GET', async () => {
      const pkg = encodeURIComponent('PKG#collection-map#1.0.0');
      const { body } = await request(app.getHttpServer())
        .get(`/packages/${pkg}`)
        .expect(200);
      expect(body?.name).toEqual('collection-map');
      expect(body?.version).toEqual('1.0.0');
    });

    it('GET (404)', async () => {
      const pkg = encodeURIComponent('PKG#i-do-not-exists#7.7.7');
      return await request(app.getHttpServer())
        .get(`/packages/${pkg}`)
        .expect(404);
    });
  });

  describe('/packages/{id}/vulns', () => {
    const pkg = encodeURIComponent('PKG#collection-map#1.0.0');
    const url = `/packages/${pkg}/vulns`;
    it('GET', async () => {
      const { body } = await request(app.getHttpServer()).get(url).expect(200);
      expect(body?.vulns?.length > 0).toBeTruthy();
      let prev = -1;
      for (const vln of body.vulns as Array<any>) {
        expect(prev).toBeLessThan(vln.severity);
        prev = vln.severity;
      }
    });

    it('GET (404)', () => {
      return request(app.getHttpServer())
        .get(`/packages/${encodeURIComponent('PKG#YEEEEEET#7.7.7')}/vulns`)
        .expect(404);
    });

    it('GET limit=2', async () => {
      const { body } = await request(app.getHttpServer())
        .get(url)
        .query({ limit: 2 })
        .expect(200);
      expect(body?.vulns?.length).toEqual(2);
    });

    it('GET limit=101 (400)', async () => {
      const limit = 101;
      return await request(app.getHttpServer())
        .get(url)
        .query({ limit })
        .expect(400);
    });

    it('GET sort=ascending', async () => {
      const { body } = await request(app.getHttpServer())
        .get(url)
        .query({ sort: 'ascending' })
        .expect(200);
      expect(body?.vulns?.length > 0).toBeTruthy();
      let prev = -1;
      for (const vln of body.vulns as Array<any>) {
        expect(prev).toBeLessThan(vln.severity);
        prev = vln.severity;
      }
    });

    it('GET sort=descending', async () => {
      const { body } = await request(app.getHttpServer())
        .get(url)
        .query({ sort: 'descending' })
        .expect(200);
      expect(body?.vulns?.length > 0).toBeTruthy();
      let prev = 1000;
      for (const vln of body.vulns as Array<any>) {
        expect(prev).toBeGreaterThan(vln.severity);
        prev = vln.severity;
      }
    });

    it('GET sort=descending limit=1', async () => {
      const { body } = await request(app.getHttpServer())
        .get(url)
        .query({ sort: 'descending', limit: 1 })
        .expect(200);
      expect(body?.vulns?.[0]?.severity).toBe(8);
    });

    it('GET lastKey={id}', async () => {
      const { body } = await request(app.getHttpServer()).get(url);
      const vulnKey = body?.vulns?.[0]?.id;
      const nextKey = body?.vulns?.[1]?.id;
      const { body: withKey } = await request(app.getHttpServer())
        .get(url)
        .query({
          lastKey: vulnKey,
        });
      expect(withKey?.vulns?.[0]?.id).toEqual(nextKey);
    });
  });

  describe('/packages/{id}/projects', () => {
    const pkg = encodeURIComponent('PKG#collection-map#1.0.0');
    const url = `/packages/${pkg}/projects`;

    it('GET', async () => {
      const { body } = await request(app.getHttpServer()).get(url).expect(200);
      expect(Array.isArray(body)).toBeTruthy();
    });

    it('GET (404)', () => {
      return request(app.getHttpServer())
        .get(`/packages/${encodeURIComponent('PKG#nope#7.7.7')}/projects`)
        .expect(404);
    });

    it('GET limit=2', async () => {
      const limit = 2;
      const { body } = await request(app.getHttpServer())
        .get(url)
        .query({ limit })
        .expect(200);
      expect(body?.length).toEqual(limit);
    });

    it('GET limit=101 (400)', async () => {
      const limit = 101;
      await request(app.getHttpServer()).get(url).query({ limit }).expect(400);
    });

    it('GET lastKey={id}', async () => {
      const response = await request(app.getHttpServer()).get(url).expect(200);
      const firstKey = response.body?.[0]?.id;
      const secondKey = response.body?.[1]?.id;
      const { body } = await request(app.getHttpServer())
        .get(url)
        .query({ lastKey: firstKey })
        .expect(200);
      expect(body?.[0]?.id).toEqual(secondKey);
    });
  });
});
