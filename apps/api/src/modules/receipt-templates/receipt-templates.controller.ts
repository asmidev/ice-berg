import { Controller, Get, Post, Delete, Body, Param, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ReceiptTemplatesService } from './receipt-templates.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('receipt-templates')
export class ReceiptTemplatesController {
  constructor(private readonly service: ReceiptTemplatesService) {}

  @Post()
  @SetPermissions('receipts.create')
  async create(@Req() req: any, @Body() body: { branch_id: string, name: string, settings: any }) {
    try {
      return await this.service.create(req.user.tenantId, body.branch_id, body.name, body.settings);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @SetPermissions('receipts.view')
  async findAll(@Req() req: any, @Query('branch_id') branchId: string) {
    try {
      return await this.service.findAll(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('receipts.delete')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.service.remove(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
