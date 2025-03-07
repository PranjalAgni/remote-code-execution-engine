import { Test, TestingModule } from '@nestjs/testing';
import { ContainerManagerService } from './container-manager.service';

describe('ContainerManagerService', () => {
  let service: ContainerManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContainerManagerService],
    }).compile();

    service = module.get<ContainerManagerService>(ContainerManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
