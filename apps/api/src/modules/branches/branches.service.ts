import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async getAllBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    });
  }

  async cleanMockBranches(tenantId: string) {
    return this.prisma.branch.deleteMany({
      where: { 
        tenant_id: tenantId,
        id: { in: ['1', '2', '3', 'all'] }
      }
    });
  }

  async getBranchById(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id, tenant_id: tenantId },
      include: {
        users: {
          select: { id: true, phone: true, role: true }
        }
      }
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async createBranch(tenantId: string, data: { name: string, address?: string }) {
    const branch = await this.prisma.branch.create({
      data: {
        ...data,
        tenant_id: tenantId
      }
    });

    // Yangi filial yaratilganda unga avtomatik kassa yaratish, nomi filial nomi bilan bir xil
    try {
      await this.prisma.cashbox.create({
        data: {
          tenant_id: tenantId,
          branch_id: branch.id,
          name: branch.name,  // <-- O'zgarish shu yerda
          type: 'PHYSICAL',
          balance: 0,
          balance_other: 0
        }
      });
    } catch (e) {
      console.error("Cashbox auto-create error:", e);
    }

    return branch;
  }

  async updateBranch(tenantId: string, id: string, data: { name?: string, address?: string, settings?: any }) {
    const branch = await this.getBranchById(tenantId, id); // Ensure it exists
    return this.prisma.branch.update({
      where: { id },
      data: {
        ...data,
        settings: data.settings ? { ...(branch.settings as any), ...data.settings } : undefined
      }
    });
  }

  async updateGateways(tenantId: string, id: string, gateways: any) {
    const branch = await this.getBranchById(tenantId, id);
    const settings = (branch.settings as any) || {};
    return this.prisma.branch.update({
      where: { id },
      data: {
        settings: {
          ...settings,
          gateways: {
            ...(settings.gateways || {}),
            ...gateways
          }
        }
      }
    });
  }

  async deleteBranch(tenantId: string, id: string) {
    await this.getBranchById(tenantId, id);
    return this.prisma.branch.delete({
      where: { id }
    });
  }
}
