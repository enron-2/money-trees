import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestModule } from '../test.module';
import { ProjectsModule } from './projects.module';

describe('Projects Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TestModule.imports(), ProjectsModule],
    }).compile();
    app = module.createNestApplication();
    TestModule.pipes(app);
    TestModule.interceptors(app);
    await app.init();
  });

  describe('/projects', () => {
    it('GET', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/projects')
        .expect(200);
      expect(Array.isArray(body)).toBeTruthy();
    });

    it('GET limit=2', async () => {
      const limit = 2;
      const { body } = await request(app.getHttpServer())
        .get('/projects')
        .query({ limit })
        .expect(200);
      expect(body?.length).toEqual(limit);
    });

    it('GET limit=101 (400)', async () => {
      const limit = 101;
      const { status } = await request(app.getHttpServer())
        .get('/projects')
        .query({ limit })
        .expect(400);
      expect(status).toEqual(400);
    });

    it('GET lastKey={id}', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .expect(200);
      const firstKey = response?.body?.[0]?.id;
      const secondKey = response?.body?.[1]?.id;
      const { body } = await request(app.getHttpServer())
        .get('/projects')
        .query({ lastKey: firstKey })
        .expect(200);
      expect(body?.[0]?.id).toEqual(secondKey);
    });
  });

  describe('/projects/{id}', () => {
    const prj = encodeURIComponent('PRJ#nestjs/nest');
    const url = `/projects/${prj}`;
    it('GET', async () => {
      const { body } = await request(app.getHttpServer()).get(url).expect(200);
      expect(body?.name).toEqual('nestjs/nest');
      expect(body?.worstSeverity).toEqual(8);
    });

    it('GET (404)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${encodeURIComponent('PRJ#hiya/there')}`)
        .expect(404);
    });
  });

  describe('/projects/{id}/packages', () => {
    const prj = encodeURIComponent('PRJ#nestjs/nest');
    const url = `/projects/${prj}/packages`;
    it('GET', async () => {
      const { body } = await request(app.getHttpServer()).get(url).expect(200);
      expect(body?.packages?.length).toBeGreaterThan(0);
    });

    it('GET (404)', () => {
      return request(app.getHttpServer())
        .get(`/projects/${encodeURIComponent('PRJ#hiya/there')}`)
        .expect(404);
    });

    it('GET limit=2', async () => {
      const limit = 2;
      const { body } = await request(app.getHttpServer())
        .get(url)
        .query({ limit })
        .expect(200);
      expect(body?.packages?.length).toEqual(limit);
    });

    it('GET limit=101 (400)', () => {
      const limit = 101;
      return request(app.getHttpServer()).get(url).query({ limit }).expect(400);
    });

    it('GET lastKey={id}', async () => {
      const res = await request(app.getHttpServer()).get(url).expect(200);
      const key1 = res?.body?.packages?.[0]?.id;
      const key2 = res?.body?.packages?.[1]?.id;
      const { body } = await request(app.getHttpServer())
        .get(url)
        .query({ lastKey: key1 })
        .expect(200);
      expect(body?.packages?.[0]?.id).toEqual(key2);
    });
  });
});
