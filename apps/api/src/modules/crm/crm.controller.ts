import { Controller, Get, Post, Put, Body, Param, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { CrmService } from './crm.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('leads')
  @SetPermissions('leads.create')
  async createLead(@Req() req: any, @Body() data: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.createLead(tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('leads/bulk')
  @SetPermissions('leads.create')
  async bulkCreateLeads(@Req() req: any, @Body() body: { leads: any[] }) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.bulkCreateLeads(tenantId, body.leads);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('leads')
  @SetPermissions('leads.view')
  async getLeads(@Req() req: any, @Query() query: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.getLeads(tenantId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stages')
  @SetPermissions('leads.view')
  async getStages(@Req() req: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.getStages(tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('archive-reasons')
  @SetPermissions('leads.view')
  async getArchiveReasons(@Req() req: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.getArchiveReasons(tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('archive-reasons')
  @SetPermissions('leads.update')
  async createArchiveReason(@Req() req: any, @Body('name') name: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.createArchiveReason(tenantId, name);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('sources')
  @SetPermissions('leads.view')
  async getSources(@Req() req: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.getSources(tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sources')
  @SetPermissions('leads.create')
  async createSource(@Req() req: any, @Body('name') name: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.createSource(tenantId, name);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('leads/:id/stage')
  @SetPermissions('leads.update')
  async updateStage(@Req() req: any, @Param('id') id: string, @Body('stageId') stageId: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.updateStage(tenantId, id, stageId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('leads/:id/convert')
  @SetPermissions('leads.convert')
  async convertToStudent(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.convertToStudent(tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('leads/:id/archive')
  @SetPermissions('leads.delete')
  async archiveLead(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.archiveLead(tenantId, id, reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('leads/:id/restore')
  @SetPermissions('leads.delete')
  async restoreLead(@Req() req: any, @Param('id') id: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.restoreLead(tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('archive-stats')
  @SetPermissions('leads.view', 'analytics.crm')
  async getArchiveStats(@Req() req: any, @Query('branch_id') branchId: string) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Unauthorized');
      return await this.crmService.getArchiveStats(tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
