import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common';
import { CrmService } from './crm.service';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('leads')
  createLead(@Req() req: any, @Body() data: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.createLead(tenantId, data);
  }

  @Get('leads')
  getLeads(@Req() req: any, @Query() query: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.getLeads(tenantId, query);
  }

  @Get('stages')
  getStages(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.getStages(tenantId);
  }


  @Get('archive-reasons')
  getArchiveReasons(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.getArchiveReasons(tenantId);
  }

  @Post('archive-reasons')
  createArchiveReason(@Req() req: any, @Body('name') name: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.createArchiveReason(tenantId, name);
  }

  @Get('sources')
  getSources(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.getSources(tenantId);
  }

  @Post('sources')
  createSource(@Req() req: any, @Body('name') name: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.createSource(tenantId, name);
  }

  @Put('leads/:id/stage')
  updateStage(@Req() req: any, @Param('id') id: string, @Body('stageId') stageId: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.updateStage(tenantId, id, stageId);
  }

  @Post('leads/:id/convert')
  convertToStudent(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.convertToStudent(tenantId, id);
  }

  @Put('leads/:id/archive')
  archiveLead(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.archiveLead(tenantId, id, reason);
  }

  @Put('leads/:id/restore')
  restoreLead(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.restoreLead(tenantId, id);
  }

  @Get('archive-stats')
  getArchiveStats(@Req() req: any, @Query('branch_id') branchId: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized');
    return this.crmService.getArchiveStats(tenantId, branchId);
  }
}
