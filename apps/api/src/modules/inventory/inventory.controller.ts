import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Categories
  @Get('categories')
  @SetPermissions('inventory.categories.view')
  async getCategories(@Req() req: any) {
    try {
      return await this.inventoryService.getCategories(req.user.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('categories')
  @SetPermissions('inventory.categories.create')
  async createCategory(@Req() req: any, @Body('name') name: string) {
    try {
      return await this.inventoryService.createCategory(req.user.tenantId, name);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('categories/:id')
  @SetPermissions('inventory.categories.update')
  async updateCategory(@Req() req: any, @Param('id') id: string, @Body('name') name: string) {
    try {
      return await this.inventoryService.updateCategory(req.user.tenantId, id, name);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('categories/:id')
  @SetPermissions('inventory.categories.delete')
  async deleteCategory(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.inventoryService.deleteCategory(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Products
  @Get('products')
  @SetPermissions('inventory.products.view')
  async getProducts(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('category_id') categoryId?: string,
    @Query('search') search?: string
  ) {
    try {
      return await this.inventoryService.getProducts(req.user.tenantId, branchId, { category_id: categoryId, search });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('products')
  @SetPermissions('inventory.products.create')
  async createProduct(@Req() req: any, @Body() body: any) {
    try {
      return await this.inventoryService.createProduct(req.user.tenantId, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('products/:id')
  @SetPermissions('inventory.products.update')
  async updateProduct(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.inventoryService.updateProduct(req.user.tenantId, id, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('products/:id')
  @SetPermissions('inventory.products.delete')
  async deleteProduct(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.inventoryService.deleteProduct(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('products/bulk')
  @SetPermissions('inventory.products.create')
  async bulkCreateProducts(@Req() req: any, @Body() data: any) {
    try {
      return await this.inventoryService.bulkCreateProducts(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
