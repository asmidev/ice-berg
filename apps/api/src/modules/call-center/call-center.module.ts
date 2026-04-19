import { Module } from '@nestjs/common';
import { CallCenterService } from './call-center.service';
import { CallCenterController } from './call-center.controller';

@Module({
  controllers: [CallCenterController],
  providers: [CallCenterService],
})
export class CallCenterModule {}
