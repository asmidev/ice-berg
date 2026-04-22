import { Controller, Get, Post, Body, Query, Req, Param, Put, HttpException, HttpStatus } from '@nestjs/common';
import { CallCenterService } from './call-center.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('call-center')
export class CallCenterController {
  constructor(private readonly callCenterService: CallCenterService) {}

  @Get('debtors')
  @SetPermissions('callcenter.debtors')
  async getDebtors(@Req() req: any, @Query() query: any) {
    try {
      return await this.callCenterService.getDebtors(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('new-leads')
  @SetPermissions('callcenter.new_leads')
  async getNewLeads(@Req() req: any, @Query() query: any) {
    try {
      return await this.callCenterService.getNewLeads(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('absentees')
  @SetPermissions('callcenter.absentees')
  async getAbsentees(@Req() req: any, @Query() query: any) {
    try {
      return await this.callCenterService.getAbsentees(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('leads')
  @SetPermissions('callcenter.leads')
  async getLeads(@Req() req: any, @Query() query: any) {
    try {
      return await this.callCenterService.getLeads(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('interaction')
  @SetPermissions('callcenter.interaction')
  async saveInteraction(@Req() req: any, @Body() data: any) {
    try {
      return await this.callCenterService.saveInteraction(req.user.tenantId, {
        ...data,
        staffId: req.user.id
      });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('leads/:id/trial')
  @SetPermissions('callcenter.leads')
  async updateLeadTrial(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.callCenterService.updateLeadTrial(req.user.tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('export')
  @SetPermissions('callcenter.leads')
  async exportLeads(@Req() req: any, @Query('branch_id') branchId: string, @Query() query: any) {
    try {
      return await this.callCenterService.exportLeadsToExcel(req.user.tenantId, branchId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('tasks/:id/resolve')
  @SetPermissions('callcenter.resolve')
  async resolveTask(@Param('id') id: string) {
    try {
      return await this.callCenterService.resolveTask(id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
