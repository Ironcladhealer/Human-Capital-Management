import { Test, TestingModule } from '@nestjs/testing';
import { TimeOffService } from './time-off.service';
import { HcmMockService } from '../hcm-mock/hcm-mock.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocalBalance } from './entities/local-balance.entity';
import { BadRequestException } from '@nestjs/common';

describe('TimeOffService', () => {
  let service: TimeOffService;
  let hcmMock: HcmMockService;

  const mockRepo = {
    findOneBy: jest.fn(),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(dto => dto),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeOffService,
        HcmMockService,
        {
          provide: getRepositoryToken(LocalBalance),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TimeOffService>(TimeOffService);
    hcmMock = module.get<HcmMockService>(HcmMockService);
  });

  it('should reject locally before hitting HCM if balance is too low', async () => {
    mockRepo.findOneBy.mockResolvedValue({ balanceDays: 2 }); // Local balance is 2
    
    // Spy on HCM to make sure it's NEVER called
    const hcmSpy = jest.spyOn(hcmMock, 'deductTimeOff');

    await expect(service.requestTimeOff('EMP2', 'LOC1', 5)).rejects.toThrow(BadRequestException);
    expect(hcmSpy).not.toHaveBeenCalled();
  });
});