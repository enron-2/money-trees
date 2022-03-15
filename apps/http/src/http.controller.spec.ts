import { Test, TestingModule } from '@nestjs/testing';
import { HttpController } from './http.controller';
import { HttpService } from './http.service';

describe('HttpController', () => {
  let httpController: HttpController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HttpController],
      providers: [HttpService],
    }).compile();

    httpController = app.get<HttpController>(HttpController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(httpController.getHello()).toBe('Hello World!');
    });
  });
});
