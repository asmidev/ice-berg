import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AttendancePenaltyService {
  private readonly logger = new Logger(AttendancePenaltyService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Running Attendance Penalty Cron Job');
    const tenants = await this.prisma.tenant.findMany();
    for (const tenant of tenants) {
      await this.processTenantPenalties(tenant);
    }
  }

  private async processTenantPenalties(tenant: any) {
    const settings = (tenant.settings as any) || {};
    const penaltyAmount = Number(settings.attendance_penalty_amount) || 0;
    const waitHours = Number(settings.attendance_penalty_wait_hours) || 4;

    if (penaltyAmount <= 0) return;

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = now.getDay();

    // Find all schedules for today for this tenant
    const schedules = await this.prisma.schedule.findMany({
      where: {
        day_of_week: dayOfWeek,
        group: {
          tenant_id: tenant.id,
          status: 'ACTIVE',
          is_archived: false,
        },
      },
      include: {
        group: {
          include: {
            teacher: true,
          },
        },
      },
    });

    for (const schedule of schedules) {
      if (!schedule.group.teacher_id) continue;

      await this.sendHourlyReminder(tenant.id, schedule, today);

      // Parse end_time (format: "HH:mm")
      const [hours, minutes] = schedule.end_time.split(':').map(Number);
      const lessonEnd = new Date(today);
      lessonEnd.setHours(hours, minutes, 0, 0);

      const deadline = new Date(lessonEnd);
      deadline.setHours(deadline.getHours() + waitHours);

      if (now > deadline) {
        // Check if attendance is missing for this (group, schedule, today)
        const attendanceCount = await this.prisma.attendance.count({
          where: {
            schedule_id: schedule.id,
            date: today,
          },
        });

        if (attendanceCount === 0) {
          await this.applyPenalty(tenant.id, schedule, penaltyAmount, today);
        }
      }
    }
  }

  private async applyPenalty(tenantId: string, schedule: any, amount: number, date: Date) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

    // Check if penalty already applied in the last hour to avoid double-firing if cron is slightly off
    const recentPenalty = await this.prisma.penalty.findFirst({
        where: {
            teacher_id: schedule.group.teacher_id,
            group_id: schedule.group.id,
            schedule_id: schedule.id,
            date: date,
            created_at: { gte: oneHourAgo }
        }
    });

    if (recentPenalty) return;

    // Create Penalty
    await this.prisma.penalty.create({
      data: {
        tenant_id: tenantId,
        teacher_id: schedule.group.teacher_id,
        group_id: schedule.group.id,
        schedule_id: schedule.id,
        amount: amount,
        reason: `${schedule.group.name} guruhida davomat o'z vaqtida qilinmaganligi uchun avtomatik jarima`,
        date: date,
        is_automated: true,
      },
    });

    // Create Notification
    await this.prisma.notification.create({
      data: {
        tenant_id: tenantId,
        type: 'PENALTY',
        channel: 'SYSTEM',
        recipient_id: schedule.group.teacher_id,
        status: 'PENDING',
      },
    });

    this.logger.log(`Applied penalty of ${amount} to teacher ${schedule.group.teacher_id} for group ${schedule.group.name}`);
  }

  private async sendHourlyReminder(tenantId: string, schedule: any, date: Date) {
    // Check if lesson has started
    const [startHours, startMinutes] = schedule.start_time.split(':').map(Number);
    const lessonStart = new Date(date);
    lessonStart.setHours(startHours, startMinutes, 0, 0);

    const now = new Date();
    if (now < lessonStart) return; // Haven't started yet

    // Check if attendance already marked
    const attendanceCount = await this.prisma.attendance.count({
      where: {
        schedule_id: schedule.id,
        date: date,
      },
    });

    if (attendanceCount > 0) return;

    // Send notification (no penalty yet, just reminder)
    // We can use a different type to distinguish
    await this.prisma.notification.create({
      data: {
        tenant_id: tenantId,
        type: 'ATTENDANCE_REMINDER',
        channel: 'SYSTEM',
        recipient_id: schedule.group.teacher_id,
        status: 'PENDING',
      },
    });
  }
}
