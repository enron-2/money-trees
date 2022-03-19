import { Test, TestingModule } from '@nestjs/testing';
import { VulnsController } from './vulns.controller';
import { VulnsService } from './vulns.service';

describe('VulnsController', () => {
  let controller: VulnsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VulnsController],
      providers: [VulnsService],
    }).compile();

    controller = module.get<VulnsController>(VulnsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
