import { Controller, Get, Post, Body, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { StaffAttendanceService } from './staff-attendance.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(private readonly service: StaffAttendanceService) {}

  @Get('list')
  @SetPermissions('staff_attendance.view')
  async getStaffList(
    @Req() req: any,
    @Query('branch_id') branchId: string,
    @Query('date') date: string,
    @Query('type') type: 'staff' | 'teacher'
  ) {
    try {
      if (type === 'teacher') {
        return await this.service.getTeacherAttendance(req.user.tenantId, branchId, date);
      }
      return await this.service.getStaffAttendance(req.user.tenantId, branchId, date);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('mark')
  @SetPermissions('staff_attendance.mark')
  async markAttendance(
    @Req() req: any,
    @Body() data: any
  ) {
    try {
      const { type, ...rest } = data;
      if (type === 'teacher') {
        return await this.service.markTeacherAttendanceDaily(req.user.tenantId, rest);
      }
      return await this.service.markStaffAttendance(req.user.tenantId, { ...rest, branchId: data.branchId });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @SetPermissions('staff_attendance.view')
  async getStats(
    @Req() req: any,
    @Query('branch_id') branchId: string,
    @Query('date') date: string
  ) {
    try {
      return await this.service.getAttendanceStats(req.user.tenantId, branchId, date);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('monthly')
  @SetPermissions('staff_attendance.view')
  async getMonthly(
    @Req() req: any,
    @Query('type') type: 'staff' | 'teacher',
    @Query('person_id') personId: string,
    @Query('year') year: string,
    @Query('month') month: string
  ) {
    try {
      if (!personId) return [];
      return await this.service.getMonthlyAttendance(req.user.tenantId, type, personId, parseInt(year), parseInt(month));
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
