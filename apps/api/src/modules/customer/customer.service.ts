import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async getAll(tenantId: string, branchId?: string) {
    const where: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') {
      where.branch_id = branchId;
    }
    return this.prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.customer.create({
      data: {
        tenant_id: tenantId,
        branch_id: data.branch_id,
        name: data.name,
        phone: data.phone,
      },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.customer.update({
      where: { id, tenant_id: tenantId },
      data: {
        branch_id: data.branch_id,
        name: data.name,
        phone: data.phone,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.customer.delete({
      where: { id, tenant_id: tenantId },
    });
  }
}
