import { Controller, Get, Post, Put, Body, Param, Req, Query, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { SetPermissions } from '../../common/decorators/permissions.decorator';
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
  @SetPermissions('students.view')
  async getAll(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.getStudents(tenantId, branchId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('archive-stats')
  @SetPermissions('students.view', 'students.archive')
  async getArchiveStats(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.getArchiveStats(tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @SetPermissions('students.create')
  async create(@Req() req: any, @Body() data: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.createStudent(tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bulk')
  @SetPermissions('students.create')
  async bulkCreate(@Req() req: any, @Body() body: { students: any[] }) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.bulkCreateStudents(tenantId, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('archive/reasons')
  @SetPermissions('students.view', 'students.archive')
  async getArchiveReasons(@Req() req: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.getArchiveReasons(tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('archive/reasons')
  @SetPermissions('students.archive')
  async createArchiveReason(@Req() req: any, @Body() body: { name: string }) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.createArchiveReason(tenantId, body.name);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @SetPermissions('students.update')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.updateStudent(tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/password')
  @SetPermissions('students.update')
  async changePassword(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.updatePassword(tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('students.delete')
  async delete(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.deleteStudent(tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @SetPermissions('students.view')
  async getOne(@Req() req: any, @Param('id') id: string, @Query('branch_id') branchId?: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.getStudentById(tenantId, id, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/groups/:groupId')
  @SetPermissions('students.update', 'groups.update')
  async assignGroup(@Req() req: any, @Param('id') id: string, @Param('groupId') groupId: string) {
    try {
      return await this.studentsService.assignToGroup(req.user.tenantId, id, groupId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/groups/transfer')
  @SetPermissions('students.update', 'groups.update')
  async transferGroup(@Req() req: any, @Param('id') id: string, @Body() body: { oldGroupId: string, newGroupId: string }) {
    try {
      return await this.studentsService.transferGroup(req.user.tenantId, id, body.oldGroupId, body.newGroupId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/archive')
  @SetPermissions('students.archive')
  async archiveStudent(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.archiveStudent(tenantId, id, body.reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/restore')
  @SetPermissions('students.restore')
  async restoreStudent(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.studentsService.restoreStudent(tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
