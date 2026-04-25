import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TimeOffService } from './time-off.service';
import { LocalBalance } from './entities/local-balance.entity';

@Resolver(() => LocalBalance)
export class TimeOffResolver {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Query(() => LocalBalance)
  async getBalance(
    @Args('employeeId') employeeId: string,
    @Args('locationId') locationId: string,
  ) {
    return this.timeOffService.getLocalBalance(employeeId, locationId);
  }

  @Mutation(() => LocalBalance)
  async requestTimeOff(
    @Args('employeeId') employeeId: string,
    @Args('locationId') locationId: string,
    @Args('days', { type: () => Int }) days: number,
  ) {
    return this.timeOffService.requestTimeOff(employeeId, locationId, days);
  }
}