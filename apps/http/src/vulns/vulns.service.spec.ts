import { Test, TestingModule } from '@nestjs/testing';
import { VulnsService } from './vulns.service';

describe('VulnsService', () => {
  let service: VulnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VulnsService],
    }).compile();

    service = module.get<VulnsService>(VulnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
