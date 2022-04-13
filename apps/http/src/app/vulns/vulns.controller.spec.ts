import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from '../test.module';
import { VulnsModule } from './vulns.module';

describe('Vulns Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TestModule.imports(), VulnsModule],
    }).compile();
    app = module.createNestApplication();
    TestModule.pipes(app);
    TestModule.interceptors(app);
    await app.init();
  });

  describe('GET /vulns', () => {
    it('GET', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .expect(200);
      expect(Array.isArray(body)).toBeTruthy();
    });

    it('GET limit=2', async () => {
      const limit = 2;
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ limit })
        .expect(200);
      expect(body?.length).toEqual(limit);
    });

    it('GET limit=101 (400)', () => {
      return request(app.getHttpServer())
        .get('/vulns')
        .query({ limit: 101 })
        .expect(400);
    });

    it('GET name=CVE-RED', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ name: 'CVE-RED' })
        .expect(200);
      expect(body?.[0]?.description).toMatch(/Red \?/);
    });

    it('GET lastKey={id}', async () => {
      const res1 = await request(app.getHttpServer()).get('/vulns').expect(200);
      const key1 = res1.body?.[0]?.id;
      const key2 = res1.body?.[1]?.id;
      const res2 = await request(app.getHttpServer())
        .get('/vulns')
        .query({ lastKey: key1 })
        .expect(200);
      expect(res2.body?.[0]?.id).toEqual(key2);
    });
  });

  describe('POST /vulns', () => {
    it('POST', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/vulns')
        .set('Accept', 'application/json')
        .send({
          name: 'CVE-hi-there',
          description: 'some desc.',
          severity: 4,
          packageIds: ['PKG#chalk#4.1.1'],
        })
        .expect(201);
      expect(body?.id).toBeDefined();
      expect(body?.name).toEqual('CVE-hi-there');
      expect(body?.severity).toEqual(4);
      await request(app.getHttpServer())
        .del(`/vulns/${encodeURIComponent(body?.id)}`)
        .expect(200);
    });

    it('POST severity=10', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/vulns')
        .set('Accept', 'application/json')
        .send({
          name: 'CVE-MAX',
          severity: 10,
          packageIds: ['PKG#chalk#4.1.1'],
        })
        .expect(201);
      expect(body?.id).toBeDefined();
      expect(body?.name).toEqual('CVE-MAX');
      expect(body?.severity).toEqual(10);
      await request(app.getHttpServer())
        .del(`/vulns/${encodeURIComponent(body?.id)}`)
        .expect(200);
    });

    it('POST (400)', async () => {
      const makeReq = (body: Record<string, any>) =>
        request(app.getHttpServer())
          .post('/vulns')
          .set('Accept', 'application/json')
          .send(body)
          .expect(400);
      await Promise.all([
        makeReq({ name: 'CVE-MAX', packageIds: ['PKG#chalk#4.1.1'] }),
        makeReq({ severity: 5, packageIds: ['PKG#chalk#4.1.1'] }),
        makeReq({
          name: 'Hiya-there',
          severity: 111,
          packageIds: ['PKG#chalk#4.1.1'],
        }),
      ]);
    });

    it('POST (404)', () => {
      return request(app.getHttpServer())
        .post('/vulns')
        .set('Accept', 'application/json')
        .send({
          name: 'Hiya-there',
          severity: 1,
          packageIds: ['PKG#oh-no#7.7.7'],
        })
        .expect(404);
    });
  });

  describe('GET /vulns/{id}', () => {
    it('GET', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .expect(200);
      const id = body?.[0]?.id;
      await request(app.getHttpServer())
        .get(`/vulns/${encodeURIComponent(id)}`)
        .expect(200);
    });
    it('GET (404)', () => {
      return request(app.getHttpServer())
        .get(`/vulns/${encodeURIComponent('VLN#&#i-dont-exists')}`)
        .expect(404);
    });
  });

  describe('PUT /vulns/{id}', () => {
    it('PUT', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ description: '?' })
        .expect(200);
      const id = body?.[0]?.id;
      const name = body?.[0]?.name;
      const description = body?.[0]?.description;
      const res = await request(app.getHttpServer())
        .put(`/vulns/${encodeURIComponent(id)}`)
        .send({
          description: 'lorem ipsum or something',
        })
        .expect(200);
      expect(res?.body?.name).toEqual(name);
      expect(res?.body?.description).toEqual('lorem ipsum or something');
      expect(res?.body?.description).not.toEqual(description);
      // Revert
      await request(app.getHttpServer())
        .put(`/vulns/${encodeURIComponent(id)}`)
        .send({ description })
        .expect(200);
    });
    it('PUT (404)', () => {
      return request(app.getHttpServer())
        .put(`/vulns/${encodeURIComponent('VLN#%#yea-its-a-no')}`)
        .send({ description: 'hello there' })
        .expect(404);
    });
    it('PUT (400)', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/vulns')
        .query({ description: '?' })
        .expect(200);
      const id = body?.[0]?.id;
      await request(app.getHttpServer())
        .put(`/vulns/${encodeURIComponent(id)}`)
        .send({ description: '' })
        .expect(400);
      const res = await request(app.getHttpServer())
        .get(`/vulns/${encodeURIComponent(id)}`)
        .expect(200);
      expect(res.body?.description).toEqual(body?.[0]?.description);
    });
  });

  describe('DELETE /vulns/{id}', () => {
    it(
      'DELETE',
      async () => {
        const { body } = await request(app.getHttpServer())
          .post('/vulns')
          .set('Accept', 'application/json')
          .send({
            name: 'CVE-MAX',
            severity: 10,
            packageIds: ['PKG#chalk#4.1.1'],
          })
          .expect(201);
        const id = body?.id;
        await request(app.getHttpServer())
          .del(`/vulns/${encodeURIComponent(id)}`)
          .expect(200);
        await request(app.getHttpServer())
          .get(`/vulns/${encodeURIComponent(id)}`)
          .expect(404);
      },
      1000 * 20
    );

    it('DELETE (404)', () => {
      return request(app.getHttpServer())
        .del(`/vulns/${encodeURIComponent('VLN#^#asdfasdf')}`)
        .expect(404);
    });
  });
});
