import { Controller, Get, Req, Query, Logger } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {
    this.logger.log('AnalyticsController initialized');
  }

  @Get('dashboard')
  getDashboardStats(
    @Req() req: any, 
    @Query('branch_id') branchId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized: Tenant ID missing');
    return this.analyticsService.getDashboardStats(tenantId, branchId, year, month);
  }

  @Get('notifications')
  getNotifications(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized: Tenant ID missing');
    return this.analyticsService.getNotifications(tenantId);
  }

  @Get('leads-report')
  getLeadsReport(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Unauthorized: Tenant ID missing');
    return this.analyticsService.getLeadsReport(tenantId, branchId, startDate, endDate);
  }

  @Get('test-route')
  testRoute() {
    return { ok: true, message: 'Analytics Controller is working' };
  }
}
