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
    const tenantId = req.user.tenantId;
    return this.attendanceService.getGroupAttendanceDetails(groupId, date, tenantId);
  }

  @Get('monthly-group-details')
  async getMonthlyGroupDetails(
    @Query('groupId') groupId: string,
    @Query('month') month: number,
    @Query('year') year: number,
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId;
    return this.attendanceService.getMonthlyGroupAttendance(groupId, month, year, tenantId);
  }

  @Get('range-group-details')
  async getRangeGroupDetails(
    @Query('groupId') groupId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId;
    return this.attendanceService.getRangeGroupAttendance(groupId, startDate, endDate, tenantId);
  }

  @Post('mark')
  async markAttendance(
    @Body() body: { 
      groupId: string; 
      date: string; 
      records: { enrollmentId: string; status: string; score?: number }[] 
    },
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId;
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
    const tenantId = req.user?.tenantId || req.tenantId;
    return this.attendanceService.getAttendanceAnalytics(tenantId, branchId, startDate, endDate);
  }

  @Get('test')
  test() {
    return { ok: true, module: 'Attendance' };
  }
}
