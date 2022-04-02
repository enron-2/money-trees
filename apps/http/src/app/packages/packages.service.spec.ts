import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../projects/projects.service';
import { PackagesService } from './packages.service';

describe('PackagesService', () => {
  let service: PackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        { provide: 'PackageModel', useValue: '' },
        { provide: ProjectsService, useValue: '' },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
