import { Test, TestingModule } from '@nestjs/testing';
import { HcmMockService } from './hcm-mock.service';

describe('HcmMockService', () => {
  let service: HcmMockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HcmMockService],
    }).compile();

    service = module.get<HcmMockService>(HcmMockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
