import { Controller, Get, Post, Body, Put, Param, Delete, Req, Query } from '@nestjs/common';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('test-ping-v2')
  testPing() {
    return { status: 'ok', message: 'Teachers controller is alive!', time: new Date().toISOString() };
  }

  @Get('archive-stats')
  getArchiveStats(@Req() req: any, @Query('branch_id') branchId: string) {
    return this.teachersService.getArchiveStats(req.user?.tenantId || 'test-tenant-123', branchId);
  }

  @Get('archive-reasons')
  getArchiveReasons(@Req() req: any) {
    return this.teachersService.getArchiveReasons(req.user?.tenantId || 'test-tenant-123');
  }

  @Post('archive-reasons')
  createArchiveReason(@Req() req: any, @Body() body: { name: string }) {
    return this.teachersService.createArchiveReason(req.user?.tenantId || 'test-tenant-123', body.name);
  }

  @Get('specializations')
  getSpecializations(@Req() req: any) {
    return this.teachersService.getSpecializations(req.user?.tenantId || 'test-tenant-123');
  }

  @Post('specializations')
  createSpecialization(@Req() req: any, @Body() body: { name: string }) {
    return this.teachersService.createSpecialization(req.user?.tenantId || 'test-tenant-123', body.name);
  }

  @Get('stats')
  getTeacherStats(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.teachersService.getTeacherStats(req.user?.tenantId || 'test-tenant-123', branchId);
  }

  @Get()
  getTeachers(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    return this.teachersService.getTeachers(req.user?.tenantId || 'test-tenant-123', branchId, query);
  }

  @Get(':id')
  getTeacherById(@Req() req: any, @Param('id') id: string, @Query('branch_id') branchId?: string) {
    return this.teachersService.getTeacherById(req.user?.tenantId || 'test-tenant-123', id, branchId);
  }

  @Post()
  createTeacher(@Req() req: any, @Body() data: any) {
    return this.teachersService.createTeacher(req.user?.tenantId || 'test-tenant-123', data);
  }

  @Put(':id')
  updateTeacher(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.teachersService.updateTeacher(req.user?.tenantId || 'test-tenant-123', id, data);
  }

  @Post(':id/attendance')
  markAttendance(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.teachersService.markTeacherAttendance(req.user?.tenantId || 'test-tenant-123', { ...data, teacher_id: id });
  }

  @Put(':id/archive')
  archiveTeacher(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.teachersService.archiveTeacher(req.user?.tenantId || 'test-tenant-123', id, body.reason);
  }

  @Put(':id/restore')
  restoreTeacher(@Req() req: any, @Param('id') id: string) {
    return this.teachersService.restoreTeacher(req.user?.tenantId || 'test-tenant-123', id);
  }

  @Delete(':id')
  deleteTeacher(@Req() req: any, @Param('id') id: string) {
    return this.teachersService.deleteTeacher(req.user?.tenantId || 'test-tenant-123', id);
  }
}
