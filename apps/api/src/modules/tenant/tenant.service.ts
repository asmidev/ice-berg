import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    return tenant?.settings || {};
  }

  async updateSettings(tenantId: string, settings: any) {
    const currentTenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const currentSettings = (currentTenant?.settings as any) || {};
    const newSettings = { ...currentSettings, ...settings };

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: newSettings },
    });
  }
}
