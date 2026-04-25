import { Test, TestingModule } from '@nestjs/testing';
import { TimeOffResolver } from './time-off.resolver';

describe('TimeOffResolver', () => {
  let resolver: TimeOffResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeOffResolver],
    }).compile();

    resolver = module.get<TimeOffResolver>(TimeOffResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
