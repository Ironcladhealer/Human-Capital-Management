import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class HcmMockService {
  private balances = new Map<string, number>();

  constructor() {
    this.balances.set('EMP1-LOC1', 10);
    this.balances.set('EMP2-LOC1', 2);
  }

  async getBalance(employeeId: string, locationId: string): Promise<number> {
    await Promise.resolve(); // Satisfies the linter
    return this.balances.get(`${employeeId}-${locationId}`) || 0;
  }

  async deductTimeOff(employeeId: string, locationId: string, days: number, simulateHcmFailure = false): Promise<boolean> {
    await Promise.resolve(); // Satisfies the linter
    const key = `${employeeId}-${locationId}`;
    const current = this.balances.get(key) || 0;

    if (!simulateHcmFailure && current < days) {
      throw new BadRequestException('Insufficient balance in HCM');
    }

    this.balances.set(key, current - days);
    return true;
  }
}