import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string, tenantId: string) {
    return this.prisma.notification.findMany({
      where: {
        tenant_id: tenantId,
        recipient_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 50, // So'nggi 50 ta bildirishnoma
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'READ' },
    });
  }
}
