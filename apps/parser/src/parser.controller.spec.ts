import { Test, TestingModule } from '@nestjs/testing';
import { ParserController } from './parser.controller';
import { ParserService } from './parser.service';

describe('ParserController', () => {
  let parserController: ParserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ParserController],
      providers: [ParserService],
    }).compile();

    parserController = app.get<ParserController>(ParserController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(parserController.getHello()).toBe('Hello World!');
    });
  });
});
