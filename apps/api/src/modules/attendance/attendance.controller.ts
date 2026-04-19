import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('group-details')
  async getGroupDetails(
    @Query('groupId') groupId: string,
    @Query('date') date: string,
    @Req() req: any
  ) {
    const tenantId = req.tenantId;
    return this.attendanceService.getGroupAttendanceDetails(groupId, date, tenantId);
  }

  @Post('mark')
  async markAttendance(
    @Body() body: { 
      groupId: string; 
      date: string; 
      records: { enrollmentId: string; status: string }[] 
    },
    @Req() req: any
  ) {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    return this.attendanceService.markAttendance({
      ...body,
      tenantId,
      markedBy: userId
    });
  }

  @Get('report')
  async getReport(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const tenantId = req.tenantId; // Using tenantId from middleware directly
    return this.attendanceService.getAttendanceAnalytics(tenantId, branchId, startDate, endDate);
  }

  @Get('test')
  test() {
    return { ok: true, module: 'Attendance' };
  }
}
