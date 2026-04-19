import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getGlobalSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId }
    });
    return tenant?.settings || {};
  }

  async updateGlobalSettings(tenantId: string, settings: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const currentSettings = (tenant?.settings as any) || {};
    const updatedSettings = { ...currentSettings, ...settings };

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: updatedSettings }
    });
  }
}
