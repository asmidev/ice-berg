import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
// Trigger reload after prisma generate
import { StaffAttendanceService } from './staff-attendance.service';

@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(private readonly service: StaffAttendanceService) {}

  @Get('list')
  async getStaffList(
    @Req() req: any,
    @Query('branch_id') branchId: string,
    @Query('date') date: string,
    @Query('type') type: 'staff' | 'teacher'
  ) {
    if (type === 'teacher') {
      return this.service.getTeacherAttendance(req.user.tenantId, branchId, date);
    }
    return this.service.getStaffAttendance(req.user.tenantId, branchId, date);
  }

  @Post('mark')
  async markAttendance(
    @Req() req: any,
    @Body() data: any
  ) {
    const { type, ...rest } = data;
    if (type === 'teacher') {
      return this.service.markTeacherAttendanceDaily(req.user.tenantId, rest);
    }
    return this.service.markStaffAttendance(req.user.tenantId, { ...rest, branchId: data.branchId });
  }

  @Get('stats')
  async getStats(
    @Req() req: any,
    @Query('branch_id') branchId: string,
    @Query('date') date: string
  ) {
    return this.service.getAttendanceStats(req.user.tenantId, branchId, date);
  }

  @Get('monthly')
  async getMonthly(
    @Req() req: any,
    @Query('type') type: 'staff' | 'teacher',
    @Query('person_id') personId: string,
    @Query('year') year: string,
    @Query('month') month: string
  ) {
    if (!personId) return [];
    return this.service.getMonthlyAttendance(req.user.tenantId, type, personId, parseInt(year), parseInt(month));
  }
}
