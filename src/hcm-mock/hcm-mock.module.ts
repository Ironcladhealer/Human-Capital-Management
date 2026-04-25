import { Module } from '@nestjs/common';
import { HcmMockService } from './hcm-mock.service';

@Module({
  providers: [HcmMockService],
  exports: [HcmMockService],
})
export class HcmMockModule {}