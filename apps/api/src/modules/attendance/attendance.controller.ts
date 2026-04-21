import { Controller, Get, Post, Body, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('group-details')
  @SetPermissions('groups.view', 'groups.attendance')
  async getGroupDetails(
    @Query('groupId') groupId: string,
    @Query('date') date: string,
    @Req() req: any
  ) {
    try {
      const tenantId = req.user.tenantId;
      return await this.attendanceService.getGroupAttendanceDetails(groupId, date, tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('monthly-group-details')
  @SetPermissions('groups.view', 'groups.attendance')
  async getMonthlyGroupDetails(
    @Query('groupId') groupId: string,
    @Query('month') month: number,
    @Query('year') year: number,
    @Req() req: any
  ) {
    try {
      const tenantId = req.user.tenantId;
      return await this.attendanceService.getMonthlyGroupAttendance(groupId, month, year, tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('range-group-details')
  @SetPermissions('groups.view', 'groups.attendance')
  async getRangeGroupDetails(
    @Query('groupId') groupId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any
  ) {
    try {
      const tenantId = req.user.tenantId;
      return await this.attendanceService.getRangeGroupAttendance(groupId, startDate, endDate, tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('mark')
  @SetPermissions('groups.attendance')
  async markAttendance(
    @Body() body: { 
      groupId: string; 
      date: string; 
      records: { enrollmentId: string; status: string; score?: number }[] 
    },
    @Req() req: any
  ) {
    try {
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      return await this.attendanceService.markAttendance({
        ...body,
        tenantId,
        markedBy: userId
      });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('report')
  @SetPermissions('analytics.academic', 'groups.view')
  async getReport(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    try {
      const tenantId = req.user?.tenantId || req.tenantId;
      return await this.attendanceService.getAttendanceAnalytics(tenantId, branchId, startDate, endDate);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('test')
  test() {
    return { ok: true, module: 'Attendance' };
  }
}
