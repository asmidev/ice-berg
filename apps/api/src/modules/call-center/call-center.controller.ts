import { Controller, Get, Post, Body, Query, Req, UseGuards, Param, Put } from '@nestjs/common';
import { CallCenterService } from './call-center.service';

@Controller('call-center')
export class CallCenterController {
  constructor(private readonly callCenterService: CallCenterService) {}

  @Get('debtors')
  getDebtors(@Req() req: any, @Query() query: any) {
    return this.callCenterService.getDebtors(req.user.tenantId, query.branch_id, query);
  }

  @Get('new-leads')
  getNewLeads(@Req() req: any, @Query() query: any) {
    return this.callCenterService.getNewLeads(req.user.tenantId, query.branch_id, query);
  }

  @Get('absentees')
  getAbsentees(@Req() req: any, @Query() query: any) {
    return this.callCenterService.getAbsentees(req.user.tenantId, query.branch_id, query);
  }

  @Post('interaction')
  saveInteraction(@Req() req: any, @Body() data: any) {
    return this.callCenterService.saveInteraction(req.user.tenantId, {
      ...data,
      staffId: req.user.id
    });
  }

  @Put('tasks/:id/resolve')
  resolveTask(@Param('id') id: string) {
    return this.callCenterService.resolveTask(id);
  }
}
