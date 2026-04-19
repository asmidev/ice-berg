import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getAll(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.customerService.getAll(req.user.tenantId, branchId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.customerService.create(req.user.tenantId, body);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.customerService.update(req.user.tenantId, id, body);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.customerService.delete(req.user.tenantId, id);
  }
}
