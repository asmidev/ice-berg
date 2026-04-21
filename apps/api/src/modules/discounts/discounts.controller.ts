import { Controller, Get, Post, Body, Param, Delete, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get('analytics')
  @SetPermissions('discounts.view', 'analytics.financial')
  async getAnalytics(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.discountsService.getAnalytics(req.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @SetPermissions('discounts.view')
  async findAll(@Req() req: any) {
    try {
      return await this.discountsService.findAll(req.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('assign')
  @SetPermissions('discounts.create')
  async assign(@Req() req: any, @Body() data: { student_id: string; discount_id: string; expires_at?: string }) {
    try {
      const expiresAt = data.expires_at ? new Date(data.expires_at) : undefined;
      return await this.discountsService.assignToStudent(req.tenantId, data.student_id, data.discount_id, expiresAt);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('assign/:id')
  @SetPermissions('discounts.delete')
  async removeAssignment(@Param('id') id: string) {
    try {
      return await this.discountsService.removeAssignment(id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @SetPermissions('discounts.create')
  async upsert(@Req() req: any, @Body() data: any) {
    try {
      return await this.discountsService.upsert(req.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('discounts.delete')
  async remove(@Param('id') id: string) {
    try {
      return await this.discountsService.delete(id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
