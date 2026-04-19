import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Categories
  @Get('categories')
  async getCategories(@Req() req: any) {
    return this.inventoryService.getCategories(req.user.tenantId);
  }

  @Post('categories')
  async createCategory(@Req() req: any, @Body('name') name: string) {
    return this.inventoryService.createCategory(req.user.tenantId, name);
  }

  @Put('categories/:id')
  async updateCategory(@Req() req: any, @Param('id') id: string, @Body('name') name: string) {
    return this.inventoryService.updateCategory(req.user.tenantId, id, name);
  }

  @Delete('categories/:id')
  async deleteCategory(@Req() req: any, @Param('id') id: string) {
    return this.inventoryService.deleteCategory(req.user.tenantId, id);
  }

  // Products
  @Get('products')
  async getProducts(
    @Req() req: any,
    @Query('branch_id') branchId?: string,
    @Query('category_id') categoryId?: string,
    @Query('search') search?: string
  ) {
    return this.inventoryService.getProducts(req.user.tenantId, branchId, { category_id: categoryId, search });
  }

  @Post('products')
  async createProduct(@Req() req: any, @Body() body: any) {
    return this.inventoryService.createProduct(req.user.tenantId, body);
  }

  @Put('products/:id')
  async updateProduct(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.inventoryService.updateProduct(req.user.tenantId, id, body);
  }

  @Delete('products/:id')
  async deleteProduct(@Req() req: any, @Param('id') id: string) {
    return this.inventoryService.deleteProduct(req.user.tenantId, id);
  }
}
