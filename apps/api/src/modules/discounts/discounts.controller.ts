import { Controller, Get, Post, Body, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get('analytics')
  getAnalytics(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.discountsService.getAnalytics(req.tenantId, branchId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.discountsService.findAll(req.tenantId);
  }

  @Post('assign')
  assign(@Req() req: any, @Body() data: { student_id: string; discount_id: string; expires_at?: string }) {
    const expiresAt = data.expires_at ? new Date(data.expires_at) : undefined;
    return this.discountsService.assignToStudent(req.tenantId, data.student_id, data.discount_id, expiresAt);
  }

  @Delete('assign/:id')
  removeAssignment(@Param('id') id: string) {
    return this.discountsService.removeAssignment(id);
  }

  @Post()
  upsert(@Req() req: any, @Body() data: any) {
    return this.discountsService.upsert(req.tenantId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountsService.delete(id);
  }
}
