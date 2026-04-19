import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { StaffService } from './staff.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('archive-stats')
  @SetPermissions('staff.view')
  async getArchiveStats(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.staffService.getArchiveStats(req.user.tenantId, branchId);
  }

  @Get()
  @SetPermissions('staff.view')
  async getAll(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    return this.staffService.getAllStaff(req.user.tenantId, branchId, query);
  }

  @Post()
  @SetPermissions('staff.manage')
  async create(@Req() req: any, @Body() body: any) {
    return this.staffService.createStaff(req.user.tenantId, body);
  }

  @Put(':id')
  @SetPermissions('staff.manage')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.staffService.updateStaff(req.user.tenantId, id, body);
  }

  @Put(':id/archive')
  @SetPermissions('staff.manage')
  async archive(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.staffService.archiveStaff(req.user.tenantId, id, body.reason);
  }

  @Put(':id/restore')
  @SetPermissions('staff.manage')
  async restore(@Req() req: any, @Param('id') id: string) {
    return this.staffService.restoreStaff(req.user.tenantId, id);
  }

  @Delete(':id')
  @SetPermissions('staff.delete')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.staffService.deleteStaff(req.user.tenantId, id);
  }
}
