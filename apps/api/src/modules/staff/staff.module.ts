import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StaffAttendanceService } from './staff-attendance.service';
import { StaffAttendanceController } from './staff-attendance.controller';

@Module({
  controllers: [StaffController, StaffAttendanceController],
  providers: [StaffService, StaffAttendanceService],
  exports: [StaffService, StaffAttendanceService]
})
export class StaffModule {}
