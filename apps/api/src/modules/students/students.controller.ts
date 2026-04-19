import { Controller, Get, Post, Put, Body, Param, Req, Query, Delete } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}
  
  @Get('me/dashboard')
  getDashboard(@Req() req: any) {
    const userId = req.user.userId || req.user.sub;
    if (!userId) throw new Error('Unauthorized');
    return this.studentsService.getStudentDashboard(userId);
  }

  @Get('me/attendance')
  getAttendance(
    @Req() req: any, 
    @Query('year') year?: string, 
    @Query('month') month?: string,
    @Query('group_id') groupId?: string
  ) {
    const userId = req.user.userId || req.user.sub;
    if (!userId) throw new Error('Unauthorized');
    return this.studentsService.getStudentAttendance(
      userId, 
      year ? parseInt(year) : new Date().getFullYear(), 
      month ? parseInt(month) : new Date().getMonth() + 1,
      groupId
    );
  }

  @Get('me/leaderboard')
  getLeaderboard(@Req() req: any, @Query('type') type: 'group' | 'center' = 'group') {
    const userId = req.user.userId || req.user.sub;
    return this.studentsService.getStudentLeaderboard(userId, type);
  }

  @Get('me/certificates')
  getCertificates(@Req() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.studentsService.getStudentCertificates(userId);
  }

  @Get('me/grades')
  getGrades(@Req() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.studentsService.getStudentGrades(userId);
  }

  @Get('me/assignments')
  getAssignments(@Req() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.studentsService.getStudentAssignments(userId);
  }

  @Get('me/invoices')
  getInvoices(@Req() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.studentsService.getStudentInvoices(userId);
  }

  @Get('me/payments')
  getPayments(@Req() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.studentsService.getStudentPayments(userId);
  }

  @Get('me/profile')
  getProfile(@Req() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.studentsService.getStudentProfile(userId);
  }

  @Get()
  getAll(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.getStudents(tenantId, branchId, query);
  }

  @Get('archive-stats')
  getArchiveStats(@Req() req: any, @Query('branch_id') branchId?: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.getArchiveStats(tenantId, branchId);
  }

  @Post()
  create(@Req() req: any, @Body() data: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.createStudent(tenantId, data);
  }

  @Get('archive/reasons')
  getArchiveReasons(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.getArchiveReasons(tenantId);
  }

  @Post('archive/reasons')
  createArchiveReason(@Req() req: any, @Body() body: { name: string }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.createArchiveReason(tenantId, body.name);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.updateStudent(tenantId, id, data);
  }

  @Put(':id/password')
  changePassword(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.updatePassword(tenantId, id, data);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.deleteStudent(tenantId, id);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string, @Query('branch_id') branchId?: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.getStudentById(tenantId, id, branchId);
  }

  @Post(':id/groups/:groupId')
  assignGroup(@Req() req: any, @Param('id') id: string, @Param('groupId') groupId: string) {
    return this.studentsService.assignToGroup(req.user.tenantId, id, groupId);
  }

  @Put(':id/groups/transfer')
  transferGroup(@Req() req: any, @Param('id') id: string, @Body() body: { oldGroupId: string, newGroupId: string }) {
    return this.studentsService.transferGroup(req.user.tenantId, id, body.oldGroupId, body.newGroupId);
  }

  @Put(':id/archive')
  archiveStudent(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.archiveStudent(tenantId, id, body.reason);
  }

  @Put(':id/restore')
  restoreStudent(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.studentsService.restoreStudent(tenantId, id);
  }
}
