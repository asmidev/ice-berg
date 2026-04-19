import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PenaltyService {
  constructor(private prisma: PrismaService) {}

  async createPenalty(data: {
    tenantId: string;
    teacherId: string;
    amount: number;
    reason: string;
    groupId?: string;
    scheduleId?: string;
    branchId?: string;
    isAutomated?: boolean;
    date?: Date;
  }) {
    return this.prisma.penalty.create({
      data: {
        tenant_id: data.tenantId,
        teacher_id: data.teacherId,
        branch_id: data.branchId,
        amount: data.amount,
        reason: data.reason,
        group_id: data.groupId,
        schedule_id: data.scheduleId,
        is_automated: data.isAutomated ?? false,
        date: data.date ?? new Date(),
      },
    });
  }

  async getTeacherPenalties(teacherId: string, tenantId: string) {
    return this.prisma.penalty.findMany({
      where: { teacher_id: teacherId, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      include: { group: true },
    });
  }

  /**
   * Har soatda kechikkan davomatlarni tekshiradi
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkAndApplyLateAttendancePenalties() {
    console.log('[PenaltyService] Kechikkan davomatlarni tekshirish boshlandi...');
    
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0-6 (Yakshanba-Shanba)
    
    // Bugungi barcha dars jadvallarini olish
    const activeSchedules = await this.prisma.schedule.findMany({
      where: {
        day_of_week: dayOfWeek,
        group: {
          status: 'ACTIVE',
          is_archived: false,
        },
      },
      include: {
        group: true,
      },
    });

    for (const schedule of activeSchedules) {
      if (!schedule.group.teacher_id) continue;

      // Darsning tugash vaqtini hisoblash
      // start_time / end_time format: "HH:mm"
      const [endHour, endMin] = schedule.end_time.split(':').map(Number);
      const classEndTime = new Date(now);
      classEndTime.setHours(endHour, endMin, 0, 0);

      // Agar dars tugaganiga 4 soatdan oshgan bo'lsa
      const fourHoursLater = new Date(classEndTime.getTime() + 4 * 60 * 60 * 1000);

      if (now > fourHoursLater) {
        // Bu sessiya uchun davomat bor-yo'qligini tekshirish
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const attendanceExists = await this.prisma.attendance.findFirst({
          where: {
            schedule_id: schedule.id,
            date: todayDate,
          },
        });

        if (!attendanceExists) {
          // Jarima allaqachon yozilganini tekshirish (dublikat oldini olish)
          const penaltyExists = await this.prisma.penalty.findFirst({
            where: {
              teacher_id: schedule.group.teacher_id,
              schedule_id: schedule.id,
              date: {
                gte: todayDate,
                lt: new Date(todayDate.getTime() + 24 * 60 * 60 * 1000),
              },
            },
          });

          if (!penaltyExists) {
            console.log(`[PenaltyService] Jarima qo'llanilmoqda: Ustoz ${schedule.group.teacher_id}, Guruh ${schedule.group.name}`);
            await this.createPenalty({
              tenantId: schedule.group.tenant_id,
              teacherId: schedule.group.teacher_id,
              branchId: schedule.group.branch_id,
              amount: 20000,
              reason: `Davomatni vaqtida qilmaganligi uchun (4 soatdan oshib ketdi). Guruh: ${schedule.group.name}`,
              groupId: schedule.group_id,
              scheduleId: schedule.id,
              isAutomated: true,
              date: todayDate,
            });
          }
        }
      }
    }
  }

  async getPenaltyStats(tenantId: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const penalizedToday = await this.prisma.penalty.findMany({
      where: {
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        date: { gte: today },
      },
      include: {
        teacher: { include: { user: true } },
        group: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Eng ko'p jarima olganlar (top 5)
    const topPenalized = await this.prisma.penalty.groupBy({
      by: ['teacher_id'],
      where: {
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
      },
      _count: { teacher_id: true },
      _sum: { amount: true },
      orderBy: { _count: { teacher_id: 'desc' } },
      take: 5,
    });

    const topPenalizedWithNames = await Promise.all(
      topPenalized.map(async (p) => {
        const teacher = await this.prisma.teacher.findUnique({
          where: { id: p.teacher_id },
          include: { user: true },
        });
        return {
          id: p.teacher_id,
          name: `${teacher?.user?.first_name} ${teacher?.user?.last_name}`,
          count: p._count.teacher_id,
          totalAmount: Number(p._sum.amount),
        };
      }),
    );

    return {
      penalizedToday: penalizedToday.map((p) => ({
        id: p.id,
        teacherName: `${p.teacher.user.first_name} ${p.teacher.user.last_name}`,
        groupName: p.group?.name || 'Noma\'lum',
        amount: Number(p.amount),
        date: p.created_at,
      })),
      topPenalized: topPenalizedWithNames,
    };
  }
}
