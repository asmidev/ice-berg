import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentCategoriesService } from './payment-categories.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('finance/payment-categories')
export class PaymentCategoriesController {
  constructor(private readonly categoriesService: PaymentCategoriesService) {}

  @Get()
  @SetPermissions('payments.view')
  async getAll(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.categoriesService.getAll(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @SetPermissions('payments.settings')
  async create(@Req() req: any, @Body() data: any) {
    try {
      return await this.categoriesService.create(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @SetPermissions('payments.settings')
  async update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.categoriesService.update(req.user.tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('payments.settings')
  async delete(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.categoriesService.delete(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
