import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @SetPermissions('customers.view')
  async getAll(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.customerService.getAll(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @SetPermissions('customers.create')
  async create(@Req() req: any, @Body() body: any) {
    try {
      return await this.customerService.create(req.user.tenantId, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @SetPermissions('customers.update')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.customerService.update(req.user.tenantId, id, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('customers.delete')
  async delete(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.customerService.delete(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
