import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from '../packages/packages.service';
import { VulnsService } from './vulns.service';

describe('VulnsService', () => {
  let service: VulnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VulnsService,
        { provide: PackagesService, useValue: '' },
        { provide: 'VulnModel', useValue: '' },
      ],
    }).compile();

    service = module.get<VulnsService>(VulnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
