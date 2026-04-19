import { Controller, Get, Post, Delete, Body, Param, Req, Query } from '@nestjs/common';
import { ReceiptTemplatesService } from './receipt-templates.service';

@Controller('receipt-templates')
export class ReceiptTemplatesController {
  constructor(private readonly service: ReceiptTemplatesService) {}

  @Post()
  create(@Req() req: any, @Body() body: { branch_id: string, name: string, settings: any }) {
    return this.service.create(req.user.tenantId, body.branch_id, body.name, body.settings);
  }

  @Get()
  findAll(@Req() req: any, @Query('branch_id') branchId: string) {
    return this.service.findAll(req.user.tenantId, branchId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.tenantId, id);
  }
}
