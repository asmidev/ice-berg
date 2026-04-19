import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query } from '@nestjs/common';
import { PaymentCategoriesService } from './payment-categories.service';

@Controller('finance/payment-categories')
export class PaymentCategoriesController {
  constructor(private readonly categoriesService: PaymentCategoriesService) {}

  @Get()
  getAll(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.categoriesService.getAll(req.user.tenantId, branchId);
  }

  @Post()
  create(@Req() req: any, @Body() data: any) {
    return this.categoriesService.create(req.user.tenantId, data);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.categoriesService.update(req.user.tenantId, id, data);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    return this.categoriesService.delete(req.user.tenantId, id);
  }
}
