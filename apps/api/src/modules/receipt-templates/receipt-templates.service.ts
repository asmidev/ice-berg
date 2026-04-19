import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReceiptTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, branchId: string, name: string, settings: any) {
    const bId = (branchId && !['all', 'null', 'undefined', ''].includes(branchId)) ? branchId : null;
    return this.prisma.receiptTemplate.create({
      data: {
        tenant_id: tenantId,
        branch_id: bId,
        name,
        settings,
      },
    });
  }

  async findAll(tenantId: string, branchId: string) {
    const where: any = { tenant_id: tenantId };
    
    // Explicitly handle valid branch IDs
    if (branchId && !['all', 'null', 'undefined', ''].includes(branchId)) {
      where.branch_id = branchId;
    }
    
    return this.prisma.receiptTemplate.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.receiptTemplate.deleteMany({
      where: { id, tenant_id: tenantId },
    });
  }
}
