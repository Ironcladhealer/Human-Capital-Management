import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalBalance } from './entities/local-balance.entity';
import { HcmMockService } from '../hcm-mock/hcm-mock.service';

@Injectable()
export class TimeOffService {
  constructor(
    @InjectRepository(LocalBalance)
    private balanceRepo: Repository<LocalBalance>,
    private hcm: HcmMockService,
  ) {}

  async getLocalBalance(employeeId: string, locationId: string): Promise<LocalBalance> {
    const id = `${employeeId}-${locationId}`;
    let record = await this.balanceRepo.findOneBy({ id });
    
    if (!record) {
      // If we don't have it locally, fetch from Source of Truth
      const hcmBalance = await this.hcm.getBalance(employeeId, locationId);
      record = this.balanceRepo.create({ id, employeeId, locationId, balanceDays: hcmBalance });
      await this.balanceRepo.save(record);
    }
    return record;
  }

  async requestTimeOff(employeeId: string, locationId: string, days: number): Promise<LocalBalance> {
    const local = await this.getLocalBalance(employeeId, locationId);

    // Defensive Check: Don't even bother hitting HCM if we know locally they don't have enough
    if (local.balanceDays < days) {
      throw new BadRequestException('Insufficient local balance');
    }

    // Try to update the Source of Truth
    await this.hcm.deductTimeOff(employeeId, locationId, days);

    // If HCM succeeds, update our local SQLite cache
    local.balanceDays -= days;
    return this.balanceRepo.save(local);
  }
}