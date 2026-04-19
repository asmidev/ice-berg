import { Controller, Get, Post, Body, Delete, Param, Req, Query, Put } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('templates')
  getTemplates(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.smsService.getTemplates(req.user.tenantId, branchId);
  }

  @Post('templates')
  createTemplate(@Req() req: any, @Body() data: any) {
    return this.smsService.createTemplate(req.user.tenantId, data);
  }

  @Delete('templates/:id')
  deleteTemplate(@Req() req: any, @Param('id') id: string) {
    return this.smsService.deleteTemplate(req.user.tenantId, id);
  }

  @Put('templates/:id')
  updateTemplate(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.smsService.updateTemplate(req.user.tenantId, id, data);
  }

  @Get('configs')
  getConfigs(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.smsService.getAutoConfigs(req.user.tenantId, branchId);
  }

  @Post('configs')
  upsertConfig(@Req() req: any, @Body() data: any) {
    return this.smsService.upsertAutoConfig(req.user.tenantId, data);
  }

  @Post('manual-send')
  async sendManualSms(@Req() req: any, @Body() data: any) {
     const { phone, message, branch_id } = data;
     return this.smsService.sendSms(req.user.tenantId, branch_id, phone, message);
  }

  @Post('send-debtors')
  async sendToDebtors(@Req() req: any, @Body('branch_id') branchId: string) {
    return this.smsService.sendToDebtors(req.user.tenantId, branchId);
  }

  @Get('report/stats')
  async getReportStats(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.smsService.getReportStats(req.user.tenantId, branchId, startDate, endDate);
  }

  @Get('report/logs')
  async getReportLogs(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.smsService.getReportLogs(req.user.tenantId, branchId, status, Number(page || 1), Number(limit || 20));
  }

  @Get('report/chart')
  async getTrafficChart(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.smsService.getTrafficChart(req.user.tenantId, branchId);
  }
}
