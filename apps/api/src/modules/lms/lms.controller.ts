import { Controller, Get, Post, Delete, Body, Req, Query, Param, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { LmsService } from './lms.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Get('stats')
  @SetPermissions('courses.view', 'groups.view')
  async getLmsStats(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.lmsService.getLmsStats(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('archive-stats')
  @SetPermissions('courses.view', 'groups.view')
  async getArchiveStats(@Req() req: any, @Query('branch_id') branchId: string) {
    try {
      return await this.lmsService.getArchiveStats(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('courses')
  @SetPermissions('courses.create')
  async createCourse(@Req() req: any, @Body() data: any) {
    try {
      return await this.lmsService.createCourse(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('courses')
  @SetPermissions('courses.view')
  async getCourses(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.lmsService.getCourses(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('courses/:id')
  @SetPermissions('courses.delete')
  async deleteCourse(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.deleteCourse(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('groups')
  @SetPermissions('groups.create')
  async createGroup(@Req() req: any, @Body() data: any) {
    try {
      return await this.lmsService.createGroup(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('groups/:id')
  @SetPermissions('groups.update')
  async updateGroup(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.lmsService.updateGroup(req.user.tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('groups/:id/description')
  @SetPermissions('groups.update')
  async updateGroupDescription(@Req() req: any, @Param('id') id: string, @Body('description') description: string) {
    try {
      return await this.lmsService.updateGroupDescription(req.user.tenantId, id, description);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('groups')
  @SetPermissions('groups.view')
  async getGroups(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    try {
      return await this.lmsService.getGroups(req.user.tenantId, branchId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('groups/:id/archive')
  @SetPermissions('groups.update')
  async archiveGroup(@Req() req: any, @Param('id') id: string, @Body('reason') reason?: string) {
    try {
      return await this.lmsService.archiveGroup(req.user.tenantId, id, reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('groups/:id/restore')
  @SetPermissions('groups.update')
  async restoreGroup(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.restoreGroup(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('groups/:id')
  @SetPermissions('groups.delete')
  async deleteGroup(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.deleteGroup(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('groups/:id/next-stage')
  @SetPermissions('groups.next_stage')
  async nextStage(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.nextStage(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('groups/:id/schedules')
  @SetPermissions('groups.schedule')
  async addSchedule(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.lmsService.addSchedule(req.user.tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('groups/:id/attendance')
  @SetPermissions('groups.view', 'groups.attendance')
  async getGroupAttendance(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.getGroupAttendance(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('groups/archived')
  @SetPermissions('groups.view')
  async getArchivedGroups(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    try {
      return await this.lmsService.getArchivedGroups(req.user.tenantId, branchId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('groups/:id')
  @SetPermissions('groups.view')
  async getGroup(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.getGroupById(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // --- Enrollment ---
  @Get('groups/:id/available-students')
  @SetPermissions('groups.update', 'students.view')
  async getAvailableStudents(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.getAvailableStudents(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('groups/:id/enroll')
  @SetPermissions('groups.update')
  async enrollStudents(@Req() req: any, @Param('id') id: string, @Body('studentIds') studentIds: string[]) {
    try {
      return await this.lmsService.enrollStudents(req.user.tenantId, id, studentIds);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('groups/:id/attendance')
  @SetPermissions('groups.attendance')
  async markAttendance(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.lmsService.markAttendance(req.user.tenantId, { ...data, groupId: id });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('enrollments/:id/unenroll-calc')
  @SetPermissions('groups.update')
  async getUnenrollmentCalc(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.calculateUnenrollmentAmount(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('enrollments/:id/unenroll')
  @SetPermissions('groups.update')
  async unenrollStudent(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.unenrollStudent(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('teachers')
  @SetPermissions('teachers.view')
  async getTeachers(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.lmsService.getTeachers(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('rooms')
  @SetPermissions('rooms.view')
  async getRooms(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.lmsService.getRooms(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('rooms')
  @SetPermissions('rooms.create')
  async createRoom(@Req() req: any, @Body() data: any) {
    try {
      return await this.lmsService.createRoom(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('rooms/:id')
  @SetPermissions('rooms.update')
  async updateRoom(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.lmsService.updateRoom(req.user.tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('rooms/:id')
  @SetPermissions('rooms.delete')
  async deleteRoom(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.lmsService.deleteRoom(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('grading-settings')
  @SetPermissions('settings.integrations', 'courses.view')
  async getGradingSettings(@Req() req: any, @Query('branch_id') branchId: string) {
    try {
      return await this.lmsService.getGradingSettings(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('grading-settings')
  @SetPermissions('settings.integrations', 'courses.update')
  async updateGradingSettings(@Req() req: any, @Query('branch_id') branchId: string, @Body() data: any) {
    try {
      return await this.lmsService.updateGradingSettings(req.user.tenantId, branchId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
