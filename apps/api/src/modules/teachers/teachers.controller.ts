import { Controller, Get, Post, Body, Put, Param, Delete, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('test-ping-v2')
  testPing() {
    return { status: 'ok', message: 'Teachers controller is alive!', time: new Date().toISOString() };
  }

  @Get('archive-stats')
  @SetPermissions('teachers.view')
  async getArchiveStats(@Req() req: any, @Query('branch_id') branchId: string) {
    try {
      return await this.teachersService.getArchiveStats(req.user?.tenantId || 'test-tenant-123', branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('archive-reasons')
  @SetPermissions('teachers.view')
  async getArchiveReasons(@Req() req: any) {
    try {
      return await this.teachersService.getArchiveReasons(req.user?.tenantId || 'test-tenant-123');
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('archive-reasons')
  @SetPermissions('teachers.create', 'teachers.update')
  async createArchiveReason(@Req() req: any, @Body() body: { name: string }) {
    try {
      return await this.teachersService.createArchiveReason(req.user?.tenantId || 'test-tenant-123', body.name);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('specializations')
  @SetPermissions('teachers.view')
  async getSpecializations(@Req() req: any) {
    try {
      return await this.teachersService.getSpecializations(req.user?.tenantId || 'test-tenant-123');
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('specializations')
  @SetPermissions('teachers.create')
  async createSpecialization(@Req() req: any, @Body() body: { name: string }) {
    try {
      return await this.teachersService.createSpecialization(req.user?.tenantId || 'test-tenant-123', body.name);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @SetPermissions('teachers.view')
  async getTeacherStats(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.teachersService.getTeacherStats(req.user?.tenantId || 'test-tenant-123', branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @SetPermissions('teachers.view')
  async getTeachers(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    try {
      return await this.teachersService.getTeachers(req.user?.tenantId || 'test-tenant-123', branchId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @SetPermissions('teachers.view')
  async getTeacherById(@Req() req: any, @Param('id') id: string, @Query('branch_id') branchId?: string) {
    try {
      return await this.teachersService.getTeacherById(req.user?.tenantId || 'test-tenant-123', id, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @SetPermissions('teachers.create')
  async createTeacher(@Req() req: any, @Body() data: any) {
    try {
      return await this.teachersService.createTeacher(req.user?.tenantId || 'test-tenant-123', data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @SetPermissions('teachers.update')
  async updateTeacher(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.teachersService.updateTeacher(req.user?.tenantId || 'test-tenant-123', id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/attendance')
  @SetPermissions('teachers.update')
  async markAttendance(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.teachersService.markTeacherAttendance(req.user?.tenantId || 'test-tenant-123', { ...data, teacher_id: id });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/archive')
  @SetPermissions('teachers.update')
  async archiveTeacher(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    try {
      return await this.teachersService.archiveTeacher(req.user?.tenantId || 'test-tenant-123', id, body.reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/restore')
  @SetPermissions('teachers.update')
  async restoreTeacher(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.teachersService.restoreTeacher(req.user?.tenantId || 'test-tenant-123', id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/check-groups')
  @SetPermissions('teachers.view')
  async checkGroups(@Param('id') id: string) {
    try {
      return await this.teachersService.checkTeacherGroups(id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('teachers.delete')
  async deleteTeacher(@Req() req: any, @Param('id') id: string, @Body() body?: any) {
    try {
      return await this.teachersService.deleteTeacher(req.user?.tenantId || 'test-tenant-123', id, body?.reassignmentData);
    } catch (e: any) {
      throw new HttpException(
        e.response || { message: e.message || 'Xatolik yuz berdi' }, 
        e.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('bulk')
  @SetPermissions('teachers.create')
  async bulkCreate(@Req() req: any, @Body() body: any) {
    try {
      return await this.teachersService.bulkCreateTeachers(req.user.tenantId, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
