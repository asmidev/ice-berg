import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PaymentCategoriesService {
  constructor(private prisma: PrismaService) {}

  async getAll(tenantId: string, branchId?: string) {
    return this.prisma.paymentCategory.findMany({
      where: {
        tenant_id: tenantId,
        ...(branchId && branchId !== 'all' ? { branch_id: branchId } : {}),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.paymentCategory.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.paymentCategory.update({
      where: { id, tenant_id: tenantId },
      data,
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.paymentCategory.delete({
      where: { id, tenant_id: tenantId },
    });
  }
}
