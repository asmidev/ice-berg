import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendancePenaltyService } from './attendance.penalty.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendancePenaltyService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
