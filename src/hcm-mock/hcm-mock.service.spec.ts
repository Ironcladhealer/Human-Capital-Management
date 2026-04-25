import { Test, TestingModule } from '@nestjs/testing';
import { HcmMockService } from './hcm-mock.service';
import { BadRequestException } from '@nestjs/common';

describe('HcmMockService', () => {
  let service: HcmMockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HcmMockService],
    }).compile();

    service = module.get<HcmMockService>(HcmMockService);
  });

  it('should return initial balances', async () => {
    const balance = await service.getBalance('EMP1', 'LOC1');
    expect(balance).toBe(10);
    
    const noBalance = await service.getBalance('UNKNOWN', 'LOC1');
    expect(noBalance).toBe(0);
  });

  it('should deduct time off successfully', async () => {
    await service.deductTimeOff('EMP1', 'LOC1', 2);
    const updated = await service.getBalance('EMP1', 'LOC1');
    expect(updated).toBe(8);
  });

  it('should throw error on insufficient balance', async () => {
    await expect(service.deductTimeOff('EMP2', 'LOC1', 5)).rejects.toThrow(BadRequestException);
  });

  it('should simulate HCM failure by bypassing the error check', async () => {
    // EMP2 only has 2 days, but we force it to accept a 5 day deduction
    const result = await service.deductTimeOff('EMP2', 'LOC1', 5, true);
    expect(result).toBe(true);
    
    const updated = await service.getBalance('EMP2', 'LOC1');
    expect(updated).toBe(-3); // HCM allowed it to go negative
  });
});