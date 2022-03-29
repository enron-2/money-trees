import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { execSync } from 'child_process';
import { isUUID } from 'class-validator';
import { v4 as uuid } from 'uuid';
import { HttpModule } from '../src/app/http.module';

describe('HttpController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    try {
      console.time('SEEDER');
      execSync('npm run seed');
      console.timeEnd('SEEDER');
    } catch (e) {
      console.log(
        `ERROR ${'='.repeat(process.stdout.columns - 'ERROR '.length)}`
      );
      console.log(e);
      console.log('='.repeat(process.stdout.columns));
    }
  }, 60000 * 2);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector))
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Packages', () => {
    it('/packages (GET)', () => {
      return request(app.getHttpServer())
        .get('/packages')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(
          ({ body }) =>
            Array.isArray(body) &&
            body.length === 10 &&
            body.every((v: any) => isUUID(v?.id))
        );
    });

    it('/packages?limit=5 (GET)', () => {
      return request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 5 })
        .expect(200)
        .expect(({ body }) => Array.isArray(body) && body.length === 5);
    });

    it('/packages?limit=1000 (GET: 400)', () => {
      return request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1000 })
        .expect(400);
    });

    it('/packages?createdAt={utc-timestamp} (GET)', () => {
      return request(app.getHttpServer())
        .get('/packages')
        .query({ createdAt: new Date().getTime() })
        .expect(200);
    });

    it('/packages/{id} (GET)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1 })
        .expect(200);
      return await request(app.getHttpServer())
        .get(`/packages/${body[0].id}`)
        .expect(200)
        .expect(({ body: body_1 }) => !Array.isArray(body_1));
    });

    it('/packages/{id} (GET: 404)', () => {
      return request(app.getHttpServer())
        .get(`/packages/${uuid()}`)
        .query({ limit: 1 })
        .expect(404);
    });

    it('/packages/{id}/vulns (GET)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1 })
        .expect(200);
      return await request(app.getHttpServer())
        .get(`/packages/${body[0].id}/vulns`)
        .expect(200)
        .expect(({ body: body_1 }) => !Array.isArray(body_1));
    });

    it('/packages/{id}/vulns (GET: 404)', async () => {
      return request(app.getHttpServer())
        .get(`/packages/${uuid()}/vulns`)
        .query({ limit: 1 })
        .expect(404);
    });
  });

  describe('Projects', () => {
    it('/projects (GET)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(
          ({ body }) =>
            Array.isArray(body) &&
            body.length === 10 &&
            body.every((v: any) => isUUID(v?.id))
        );
    });

    it('/projects?limit=5 (GET)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .query({ limit: 5 })
        .expect(200)
        .expect(({ body }) => Array.isArray(body) && body.length === 5);
    });

    it('/projects?limit=1000 (GET: 400)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .query({ limit: 1000 })
        .expect(400);
    });

    it('/projects?lastKey={uuid} (GET)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/projects')
        .query({ limit: 5 })
        .expect(200);
      const secondLastKey = (body as Array<any>).at(-2).id;
      const lastKey = (body as Array<any>).at(-1).id;
      const { body: body_1 } = await request(app.getHttpServer())
        .get('/projects')
        .query({ lastKey: secondLastKey })
        .expect(200);
      expect(body_1[0].id).toBe(lastKey);
    });

    it('/projects/{id} (GET)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/projects')
        .query({ limit: 1 });
      return await request(app.getHttpServer())
        .get(`/projects/${body[0].id}`)
        .expect(200)
        .expect(
          ({ body: body_1 }) => !Array.isArray(body_1) && !!body_1.packages
        );
    });

    it('/projects/{id} (GET: 404)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${uuid()}`)
        .query({ limit: 1 })
        .expect(404);
    });

    it('/projects/{id}/packages (GET)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/projects')
        .query({ limit: 1 })
        .expect(200);
      const { body: body_1 } = await request(app.getHttpServer())
        .get(`/projects/${body[0].id}/packages`)
        .expect(200);
      return (
        !Array.isArray(body_1) &&
        !!body_1?.packages &&
        Array.isArray(body_1.packages) &&
        body_1.packages?.every((v: any) => isUUID(v))
      );
    });

    it('/projects/{id}/packages (GET: 404)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${uuid()}/packages`)
        .query({ limit: 1 })
        .expect(404);
    });
  });

  describe('Vulns', () => {
    beforeEach(async () => {
      // TODO: add these via seeder
      const { body } = await request(app.getHttpServer())
        .get('/packages?name=chalk')
        .expect(200);
      const packageIds: string[] = (body as Array<any>).map((elem) => elem.id);
      await request(app.getHttpServer())
        .post('/vulns')
        .set('Accept', 'application/json')
        .send({
          cve: 'CVE-2022-420',
          title: 'Chalk chalk chalk',
          description: 'Turns out chalks are not waterproof',
          severity: 4,
          packageIds,
        })
        .expect(201);
    });

    afterEach(async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .expect(200);
      const vulnIds: string[] = (body as Array<any>).map((elem) => elem.id);
      await Promise.all(
        vulnIds.map((vuln) =>
          request(app.getHttpServer()).del(`/vulns/${vuln}`).expect(200)
        )
      );
    });

    it('/vulns (GET)', () => {
      return request(app.getHttpServer())
        .get('/vulns')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(
          ({ body }) =>
            Array.isArray(body) && body.every((v: any) => isUUID(v?.id))
        );
    });

    it('/vulns?limit=2 (GET)', () => {
      return request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 2 })
        .expect(200)
        .expect(({ body }) => Array.isArray(body) && body.length === 2);
    });

    it('/vulns?limit=1000 (GET)', () => {
      return request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1000 })
        .expect(400);
    });

    it('/vulns?severity=4 (GET)', () => {
      return request(app.getHttpServer())
        .get('/vulns')
        .query({ severity: 4 })
        .expect(200)
        .expect(({ body }) => Array.isArray(body) && body.length !== 0);
    });

    it('/vulns/{id} (GET)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      return await request(app.getHttpServer())
        .get(`/vulns/${body[0].id}`)
        .expect(200)
        .expect(({ body: body_1 }) => !Array.isArray(body_1));
    });

    it('/vulns/{id} (GET: 404)', () => {
      return request(app.getHttpServer())
        .get(`/vulns/${uuid()}`)
        .query({ limit: 1 })
        .expect(404);
    });

    it('/vulns/{id}/packages (GET)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      const { body: pkgs } = await request(app.getHttpServer())
        .get(`/vulns/${body[0].id}/packages`)
        .query({ limit: 2 })
        .expect(200);
      const { body: expPkgs } = await request(app.getHttpServer())
        .get(`/vulns/${body[0].id}/packages`)
        .query({ lastKey: pkgs[0].id })
        .expect(200);
      expect(pkgs[0]).not.toMatchObject(expPkgs[0]);
      expect(pkgs[1]).toMatchObject(expPkgs[0]);
    });

    it('/vulns/{id}/packages (GET: 404)', async () => {
      await request(app.getHttpServer())
        .get(`/vulns/${uuid()}/packages`)
        .expect(404);
    });

    it('/vulns (POST)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/packages?name=rxjs')
        .expect(200);
      const packageIds: string[] = (body as Array<any>).map((elem) => elem.id);
      await request(app.getHttpServer())
        .post('/vulns')
        .set('Accept', 'application/json')
        .send({
          cve: 'CVE-2022-007',
          title: 'RexJs is bad',
          description: 'Huhh???',
          severity: 8,
          packageIds,
        })
        .expect(201);
    });

    it('/vulns/{id} (PUT)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      const { body: body_1 } = await request(app.getHttpServer())
        .put(`/vulns/${body[0].id}`)
        .send({ severity: 2 })
        .expect(200);
      expect(body[0].severity).not.toBe(body_1.severity);
      expect(body_1.id).toBeDefined();
      expect(body_1.title).toBeDefined();
      expect(body_1.severity).toBeDefined();
    });

    it('/vulns/{id} (PUT: 404)', async () => {
      await request(app.getHttpServer())
        .put(`/vulns/${uuid()}`)
        .send({ severity: 2 })
        .expect(404);
    });

    it('/vulns/{id} (DELETE)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      await request(app.getHttpServer())
        .del(`/vulns/${body[0].id}`)
        .expect(200);
      const { body: body_1 } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      expect(body).not.toMatchObject(body_1);
    });

    it('/vulns/{id} (DELETE)', async () => {
      await request(app.getHttpServer()).del(`/vulns/${uuid()}`).expect(404);
    });

    it('/vulns/{vulnId}/packages/{packageId} (PUT)', async () => {
      const { body: vuln } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      const { body: pkg } = await request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1 })
        .expect(200);
      const linked = await request(app.getHttpServer())
        .put(`/vulns/${vuln[0].id}/packages/${pkg[0].id}`)
        .expect(200);
      expect(linked.body.id).toBe(pkg[0].id);
      expect(
        linked.body.vulns?.find((v: any) => v.id === vuln[0].id)
      ).toBeDefined();
      const linked2 = await request(app.getHttpServer())
        .put(`/vulns/${vuln[0].id}/packages/${pkg[0].id}`)
        .expect(200);
      expect(linked.body).toMatchObject(linked2.body);
    });

    it('/vulns/{vulnId}/packages/{packageId} (PUT: 404)', async () => {
      const { body: vuln } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      const { body: pkg } = await request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1 })
        .expect(200);
      await request(app.getHttpServer())
        .put(`/vulns/${vuln[0].id}/packages/${uuid()}`)
        .expect(404);
      await request(app.getHttpServer())
        .put(`/vulns/${uuid()}/packages/${pkg[0].id}`)
        .expect(404);
      await request(app.getHttpServer())
        .put(`/vulns/${uuid()}/packages/${uuid()}`)
        .expect(404);
    });

    it('/vulns/{vulnId}/packages/{packageId} (DELETE)', async () => {
      const { body: vuln } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      const { body: pkg } = await request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1 })
        .expect(200);
      await request(app.getHttpServer())
        .del(`/vulns/${vuln[0].id}/packages/${pkg[0].id}`)
        .expect(200);
      const unlink = await request(app.getHttpServer())
        .put(`/vulns/${vuln[0].id}/packages/${pkg[0].id}`)
        .expect(200);
      expect(unlink.body.id).toBe(pkg[0].id);
      if (unlink.body.vulns?.length > 0)
        expect(
          unlink.body.vulns?.find((v: any) => v.id === vuln[0].id)
        ).toBeDefined();
      else expect(unlink.body.vulns).toBe([]);
    });

    it('/vulns/{vulnId}/packages/{packageId} (DELETE: 404)', async () => {
      const { body: vuln } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 1 })
        .expect(200);
      const { body: pkg } = await request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1 })
        .expect(200);
      await request(app.getHttpServer())
        .del(`/vulns/${vuln[0].id}/packages/${uuid()}`)
        .expect(404);
      await request(app.getHttpServer())
        .del(`/vulns/${uuid()}/packages/${pkg[0].id}`)
        .expect(404);
      await request(app.getHttpServer())
        .del(`/vulns/${uuid()}/packages/${uuid()}`)
        .expect(404);
    });
  });
});
