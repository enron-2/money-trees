import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { HttpModule } from '../src/app/http.module';

describe('HttpController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          exposeUnsetFields: false,
          excludeExtraneousValues: true,
        },
      })
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector))
    );
    await app.init();
  });

  it('compiles', () => {
    expect(app).toBeDefined();
  });

  it('link package without vuln to a vuln', async () => {
    const getPrjBody = async () => {
      const prjId = encodeURIComponent('PRJ#lodash/lodash');
      const { body } = await request(app.getHttpServer())
        .get(`/projects/${prjId}`)
        .expect(200);
      return body;
    };

    const initPrj = await getPrjBody();
    expect(initPrj?.name).toEqual('lodash/lodash');
    expect(initPrj?.worstSeverity).toBeUndefined();

    const vulnResponse = await request(app.getHttpServer())
      .get('/vulns')
      .query({ name: 'CVE-RED' })
      .expect(200);
    const vlnId = encodeURIComponent(vulnResponse?.body?.[0]?.id);
    const pkgId = encodeURIComponent('PKG#commander#2.15.1');
    await request(app.getHttpServer())
      .put(`/vulns/${vlnId}/packages/${pkgId}`)
      .expect(200);

    const finalPrj = await getPrjBody();
    expect(finalPrj?.name).toEqual('lodash/lodash');
    expect(finalPrj?.worstSeverity).toEqual(7);
  });

  it('link project to a higher vuln', async () => {
    const getPrjBody = async () => {
      const prjId = encodeURIComponent('PRJ#lodash/lodash');
      const { body } = await request(app.getHttpServer())
        .get(`/projects/${prjId}`)
        .expect(200);
      return body;
    };

    const initPrj = await getPrjBody();
    expect(initPrj?.name).toEqual('lodash/lodash');
    expect(initPrj?.worstSeverity).toEqual(7);

    const vulnResponse = await request(app.getHttpServer())
      .get('/vulns')
      .query({ name: 'CVE-BLUE' })
      .expect(200);
    const vlnId = encodeURIComponent(vulnResponse?.body?.[0]?.id);
    const pkgId = encodeURIComponent('PKG#commander#2.15.1');
    await request(app.getHttpServer())
      .put(`/vulns/${vlnId}/packages/${pkgId}`)
      .expect(200);

    const finalPrj = await getPrjBody();
    expect(finalPrj?.name).toEqual('lodash/lodash');
    expect(finalPrj?.worstSeverity).toEqual(8);
  });

  it('unlink project from a higher vuln', async () => {
    const getPrjBody = async () => {
      const prjId = encodeURIComponent('PRJ#lodash/lodash');
      const { body } = await request(app.getHttpServer())
        .get(`/projects/${prjId}`)
        .expect(200);
      return body;
    };

    const initPrj = await getPrjBody();
    expect(initPrj?.name).toEqual('lodash/lodash');
    expect(initPrj?.worstSeverity).toEqual(8);

    const vulnResponse = await request(app.getHttpServer())
      .get('/vulns')
      .query({ name: 'CVE-BLUE' })
      .expect(200);
    const vlnId = encodeURIComponent(vulnResponse?.body?.[0]?.id);
    const pkgId = encodeURIComponent('PKG#commander#2.15.1');
    await request(app.getHttpServer())
      .del(`/vulns/${vlnId}/packages/${pkgId}`)
      .expect(200);

    const finalPrj = await getPrjBody();
    expect(finalPrj?.name).toEqual('lodash/lodash');
    expect(finalPrj?.worstSeverity).toEqual(7);
  });

  it('unlink package with one vuln from a vuln', async () => {
    const getPrjBody = async () => {
      const prjId = encodeURIComponent('PRJ#lodash/lodash');
      const { body } = await request(app.getHttpServer())
        .get(`/projects/${prjId}`)
        .expect(200);
      return body;
    };
    const initPrj = await getPrjBody();
    expect(initPrj?.worstSeverity).toEqual(7);

    const vulnResponse = await request(app.getHttpServer())
      .get('/vulns')
      .query({ name: 'CVE-RED' })
      .expect(200);
    const vlnId = encodeURIComponent(vulnResponse?.body?.[0]?.id);
    const pkgId = encodeURIComponent('PKG#commander#2.15.1');
    await request(app.getHttpServer())
      .del(`/vulns/${vlnId}/packages/${pkgId}`)
      .expect(200);

    const finalPrj = await getPrjBody();
    expect(finalPrj?.name).toEqual('lodash/lodash');
    expect(finalPrj?.worstSeverity).toBeUndefined();
  });
});
