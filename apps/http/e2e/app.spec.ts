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
import { HttpModule } from '../src/app/http.module';

describe('HttpController (e2e)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);
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
    jest.setTimeout(5000);
  });

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

    it('/packages?limit=1000 (GET)', () => {
      return request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1000 })
        .expect(400);
    });

    it('/packages/{id} (GET)', () => {
      return request(app.getHttpServer())
        .get('/packages')
        .query({ limit: 1 })
        .expect(({ body }) =>
          request(app.getHttpServer())
            .get(`/packages/${body[0].id}`)
            .expect(200)
            .expect(({ body }) => !Array.isArray(body))
        );
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

    it('/projects?limit=1000 (GET)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .query({ limit: 1000 })
        .expect(400);
    });

    it('/projects/{id} (GET)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .query({ limit: 1 })
        .expect(({ body }) =>
          request(app.getHttpServer())
            .get(`/projects/${body[0].id}`)
            .expect(200)
            .expect(({ body }) => !Array.isArray(body) && !!body.packages)
        );
    });

    it('/projects/{id}/packages (GET)', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .query({ limit: 1 })
        .expect(({ body }) =>
          request(app.getHttpServer())
            .get(`/projects/${body[0].id}/packages`)
            .expect(200)
            .expect(
              ({ body }) =>
                !Array.isArray(body) &&
                !!body?.packages &&
                Array.isArray(body.packages) &&
                body.packages?.every((v: any) => isUUID(v))
            )
        );
    });
  });
});
