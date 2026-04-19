import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Product Categories
  async getCategories(tenantId: string) {
    return this.prisma.productCategory.findMany({
      where: { tenant_id: tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(tenantId: string, name: string) {
    return this.prisma.productCategory.create({
      data: {
        tenant_id: tenantId,
        name,
      },
    });
  }

  async updateCategory(tenantId: string, id: string, name: string) {
    return this.prisma.productCategory.update({
      where: { id, tenant_id: tenantId },
      data: { name },
    });
  }

  async deleteCategory(tenantId: string, id: string) {
    return this.prisma.productCategory.delete({
      where: { id, tenant_id: tenantId },
    });
  }

  // Products
  async getProducts(tenantId: string, branchId?: string, query?: any) {
    const where: any = { tenant_id: tenantId };
    
    if (branchId && branchId !== 'all') {
      where.branch_id = branchId;
    }

    if (query?.category_id && query.category_id !== 'all') {
      where.category_id = query.category_id;
    }

    if (query?.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    return this.prisma.product.findMany({
      where,
      include: { category: true, branch: true },
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(tenantId: string, data: any) {
    return this.prisma.product.create({
      data: {
        tenant_id: tenantId,
        branch_id: data.branch_id,
        category_id: data.category_id,
        name: data.name,
        stock: data.stock || 0,
        price: data.price,
        cost_price: data.cost_price || 0,
        is_for_sale: data.is_for_sale ?? true,
        is_top: data.is_top ?? false,
        photo_url: data.photo_url,
      },
    });
  }

  async updateProduct(tenantId: string, id: string, data: any) {
    return this.prisma.product.update({
      where: { id, tenant_id: tenantId },
      data: {
        branch_id: data.branch_id,
        category_id: data.category_id,
        name: data.name,
        stock: data.stock,
        price: data.price,
        cost_price: data.cost_price,
        is_for_sale: data.is_for_sale,
        is_top: data.is_top,
        photo_url: data.photo_url,
      },
    });
  }

  async deleteProduct(tenantId: string, id: string) {
    return this.prisma.product.delete({
      where: { id, tenant_id: tenantId },
    });
  }
}
