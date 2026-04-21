import { Controller, Get, Post, Body, Delete, Param, Req, Query, Put, HttpException, HttpStatus } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('templates')
  @SetPermissions('sms.templates.view', 'settings.office')
  async getTemplates(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.smsService.getTemplates(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('templates')
  @SetPermissions('sms.templates.update', 'settings.office')
  async createTemplate(@Req() req: any, @Body() data: any) {
    try {
      return await this.smsService.createTemplate(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('templates/:id')
  @SetPermissions('sms.templates.update', 'settings.office')
  async deleteTemplate(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.smsService.deleteTemplate(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('templates/:id')
  @SetPermissions('sms.templates.update', 'settings.office')
  async updateTemplate(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.smsService.updateTemplate(req.user.tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('configs')
  @SetPermissions('sms.templates.view', 'settings.office')
  async getConfigs(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.smsService.getAutoConfigs(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('configs')
  @SetPermissions('sms.templates.update', 'settings.office')
  async upsertConfig(@Req() req: any, @Body() data: any) {
    try {
      return await this.smsService.upsertAutoConfig(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('manual-send')
  @SetPermissions('sms.send')
  async sendManualSms(@Req() req: any, @Body() data: any) {
    try {
      const { phone, message, branch_id } = data;
      return await this.smsService.sendSms(req.user.tenantId, branch_id, phone, message);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-debtors')
  @SetPermissions('sms.send')
  async sendToDebtors(@Req() req: any, @Body('branch_id') branchId: string) {
    try {
      return await this.smsService.sendToDebtors(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('report/stats')
  @SetPermissions('sms.reports', 'analytics.crm')
  async getReportStats(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    try {
      return await this.smsService.getReportStats(req.user.tenantId, branchId, startDate, endDate);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('report/logs')
  @SetPermissions('sms.reports', 'analytics.crm')
  async getReportLogs(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    try {
      return await this.smsService.getReportLogs(req.user.tenantId, branchId, status, Number(page || 1), Number(limit || 20));
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('report/chart')
  @SetPermissions('sms.reports', 'analytics.crm')
  async getTrafficChart(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.smsService.getTrafficChart(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
