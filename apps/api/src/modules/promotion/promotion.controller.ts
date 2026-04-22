import { Controller, Get, Post, Body, Req, Query, Param, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @SetPermissions('promotions.create')
  async createPromotion(@Req() req: any, @Body() data: any) {
    try {
      return await this.promotionService.createPromotion(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @SetPermissions('promotions.view')
  async getPromotions(@Req() req: any, @Query('branch_id') branchId?: string, @Query() query?: any) {
    try {
      return await this.promotionService.getPromotions(req.user.tenantId, branchId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @SetPermissions('promotions.view')
  async getPromotion(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.promotionService.getPromotionById(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('classes/:classId')
  @SetPermissions('promotions.update')
  async updateClass(@Req() req: any, @Param('classId') classId: string, @Body() data: any) {
    try {
      return await this.promotionService.updatePromotionClass(req.user.tenantId, classId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/leads')
  @SetPermissions('promotions.update')
  async addLeads(@Req() req: any, @Param('id') id: string, @Body() data: any[]) {
    try {
      return await this.promotionService.addLeadsToPromotion(req.user.tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
