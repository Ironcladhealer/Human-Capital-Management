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
    create: jest.fn().mockImplementation((dto: LocalBalance) => dto),
    save: jest.fn().mockImplementation((dto: LocalBalance) => dto),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLocalBalance', () => {
    it('should return existing local balance if found', async () => {
      const mockBalance = { id: 'EMP1-LOC1', balanceDays: 10 };
      mockRepo.findOneBy.mockResolvedValue(mockBalance);

      const result = await service.getLocalBalance('EMP1', 'LOC1');
      expect(result).toEqual(mockBalance);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should fetch from HCM and save if no local balance exists', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);
      jest.spyOn(hcmMock, 'getBalance').mockResolvedValue(15);

      const result = await service.getLocalBalance('EMP1', 'LOC1');
      expect(hcmMock.getBalance).toHaveBeenCalledWith('EMP1', 'LOC1');
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.balanceDays).toBe(15);
    });
  });

  describe('requestTimeOff', () => {
    it('should reject locally before hitting HCM if balance is too low', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 'EMP2-LOC1', balanceDays: 2 });
      const hcmSpy = jest.spyOn(hcmMock, 'deductTimeOff');

      await expect(service.requestTimeOff('EMP2', 'LOC1', 5)).rejects.toThrow(BadRequestException);
      expect(hcmSpy).not.toHaveBeenCalled();
    });

    it('should successfully deduct time off and update local database', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 'EMP1-LOC1', balanceDays: 10 });
      jest.spyOn(hcmMock, 'deductTimeOff').mockResolvedValue(true);

      const result = await service.requestTimeOff('EMP1', 'LOC1', 3);
      
      expect(hcmMock.deductTimeOff).toHaveBeenCalledWith('EMP1', 'LOC1', 3);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.balanceDays).toBe(7);
    });
  });
});