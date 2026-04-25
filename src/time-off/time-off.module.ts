import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeOffService } from './time-off.service';
import { TimeOffResolver } from './time-off.resolver';
import { LocalBalance } from './entities/local-balance.entity';
import { HcmMockModule } from '../hcm-mock/hcm-mock.module';

@Module({
  imports: [TypeOrmModule.forFeature([LocalBalance]), HcmMockModule],
  providers: [TimeOffResolver, TimeOffService],
})
export class TimeOffModule {}