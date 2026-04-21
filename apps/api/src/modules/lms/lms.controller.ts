import { Controller, Get, Post, Delete, Body, Req, Query, Param, Patch } from '@nestjs/common';
import { LmsService } from './lms.service';

@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Get('stats')
  getLmsStats(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.lmsService.getLmsStats(req.user.tenantId, branchId);
  }

  @Get('archive-stats')
  getArchiveStats(@Req() req: any, @Query('branch_id') branchId: string) {
    return this.lmsService.getArchiveStats(req.user.tenantId, branchId);
  }

  @Post('courses')
  createCourse(@Req() req: any, @Body() data: any) {
    return this.lmsService.createCourse(req.user.tenantId, data);
  }

  @Get('courses')
  getCourses(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.lmsService.getCourses(req.user.tenantId, branchId);
  }

  @Delete('courses/:id')
  deleteCourse(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.deleteCourse(req.user.tenantId, id);
  }

  @Post('groups')
  createGroup(@Req() req: any, @Body() data: any) {
    return this.lmsService.createGroup(req.user.tenantId, data);
  }

  @Post('groups/:id')
  updateGroup(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.lmsService.updateGroup(req.user.tenantId, id, data);
  }

  @Patch('groups/:id/description')
  updateGroupDescription(@Req() req: any, @Param('id') id: string, @Body('description') description: string) {
    return this.lmsService.updateGroupDescription(req.user.tenantId, id, description);
  }

  @Get('groups')
  getGroups(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    return this.lmsService.getGroups(req.user.tenantId, branchId, query);
  }

  @Post('groups/:id/archive')
  archiveGroup(@Req() req: any, @Param('id') id: string, @Body('reason') reason?: string) {
    return this.lmsService.archiveGroup(req.user.tenantId, id, reason);
  }

  @Post('groups/:id/restore')
  restoreGroup(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.restoreGroup(req.user.tenantId, id);
  }

  @Delete('groups/:id')
  deleteGroup(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.deleteGroup(req.user.tenantId, id);
  }

  @Post('groups/:id/next-stage')
  nextStage(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.nextStage(req.user.tenantId, id);
  }

  @Post('groups/:id/schedules')
  addSchedule(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.lmsService.addSchedule(req.user.tenantId, id, data);
  }

  @Get('groups/:id/attendance')
  getGroupAttendance(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.getGroupAttendance(req.user.tenantId, id);
  }

  @Get('groups/archived')
  getArchivedGroups(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    return this.lmsService.getArchivedGroups(req.user.tenantId, branchId, query);
  }

  @Get('groups/:id')
  getGroup(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.getGroupById(req.user.tenantId, id);
  }

  // --- Enrollment ---
  @Get('groups/:id/available-students')
  getAvailableStudents(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.getAvailableStudents(req.user.tenantId, id);
  }

  @Post('groups/:id/enroll')
  enrollStudents(@Req() req: any, @Param('id') id: string, @Body('studentIds') studentIds: string[]) {
    return this.lmsService.enrollStudents(req.user.tenantId, id, studentIds);
  }

  @Post('groups/:id/attendance')
  markAttendance(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.lmsService.markAttendance(req.user.tenantId, { ...data, groupId: id });
  }

  @Get('enrollments/:id/unenroll-calc')
  getUnenrollmentCalc(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.calculateUnenrollmentAmount(req.user.tenantId, id);
  }

  @Delete('enrollments/:id/unenroll')
  unenrollStudent(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.unenrollStudent(req.user.tenantId, id);
  }

  @Get('teachers')
  getTeachers(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.lmsService.getTeachers(req.user.tenantId, branchId);
  }

  @Get('rooms')
  getRooms(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.lmsService.getRooms(req.user.tenantId, branchId);
  }

  @Post('rooms')
  createRoom(@Req() req: any, @Body() data: any) {
    return this.lmsService.createRoom(req.user.tenantId, data);
  }

  @Post('rooms/:id')
  updateRoom(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.lmsService.updateRoom(req.user.tenantId, id, data);
  }

  @Delete('rooms/:id')
  deleteRoom(@Req() req: any, @Param('id') id: string) {
    return this.lmsService.deleteRoom(req.user.tenantId, id);
  }

  @Get('grading-settings')
  getGradingSettings(@Req() req: any, @Query('branch_id') branchId: string) {
    return this.lmsService.getGradingSettings(req.user.tenantId, branchId);
  }

  @Post('grading-settings')
  updateGradingSettings(@Req() req: any, @Query('branch_id') branchId: string, @Body() data: any) {
    return this.lmsService.updateGradingSettings(req.user.tenantId, branchId, data);
  }
}
