import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { StaffService } from './staff.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('archive-stats')
  @SetPermissions('staff.view')
  async getArchiveStats(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.staffService.getArchiveStats(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @SetPermissions('staff.view')
  async getAll(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    try {
      return await this.staffService.getAllStaff(req.user.tenantId, branchId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @SetPermissions('staff.create')
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.staffService.createStaff(req.user.tenantId, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @SetPermissions('staff.update')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.staffService.updateStaff(req.user.tenantId, id, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/archive')
  @SetPermissions('staff.update')
  async archive(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    try {
      return await this.staffService.archiveStaff(req.user.tenantId, id, body.reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/restore')
  @SetPermissions('staff.update')
  async restore(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.staffService.restoreStaff(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('staff.delete')
  async delete(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.staffService.deleteStaff(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
