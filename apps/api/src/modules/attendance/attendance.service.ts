import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async getGroupAttendanceDetails(groupId: string, date: string, tenantId: string) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const group = await this.prisma.group.findUnique({
      where: { id: groupId, tenant_id: tenantId },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              include: { user: true }
            },
            attendances: {
              where: { date: attendanceDate }
            }
          }
        },
        schedules: true
      }
    });

    if (!group) throw new Error('Group not found');

    const students = group.enrollments.map(e => ({
      enrollmentId: e.id,
      studentId: e.student_id,
      name: `${e.student.user.first_name} ${e.student.user.last_name}`,
      status: e.attendances[0]?.status || 'NOT_MARKED',
      attendanceId: e.attendances[0]?.id
    }));

    return {
      groupId: group.id,
      groupName: group.name,
      date: attendanceDate,
      schedules: group.schedules,
      students
    };
  }

  async markAttendance(data: {
    groupId: string;
    date: string;
    records: { enrollmentId: string; status: string; score?: number }[];
    tenantId: string;
    markedBy?: string;
  }) {
    const attendanceDate = new Date(data.date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Get group schedule for this date (simplified: just use the first schedule if multiple exists for the day)
    const dayOfWeek = attendanceDate.getDay();
    const group = await this.prisma.group.findUnique({
      where: { id: data.groupId },
      include: { schedules: { where: { day_of_week: dayOfWeek } } }
    });

    if (!group) throw new Error('Group not found');
    const scheduleId = group.schedules[0]?.id;
    if (!scheduleId) throw new Error('Haftaning ushbu kunida dars jadvali mavjud emas');

    const results = await Promise.all(
      data.records.map(async (r) => {
        const result = await this.prisma.attendance.upsert({
          where: {
            enrollment_id_schedule_id_date: {
              enrollment_id: r.enrollmentId,
              schedule_id: scheduleId,
              date: attendanceDate
            }
          },
          update: {
            status: r.status,
            score: r.score,
            marked_by: data.markedBy,
            marked_at: new Date()
          },
          create: {
            enrollment_id: r.enrollmentId,
            schedule_id: scheduleId,
            date: attendanceDate,
            status: r.status,
            score: r.score,
            marked_by: data.markedBy
          }
        });

        // Trigger Auto-Freeze logic if status is ABSENT
        if (r.status === 'ABSENT') {
          await this.handleConsecutiveAbsences(r.enrollmentId, data.tenantId, group.branch_id);
        }

        return result;
      })
    );

    return results;
  }

  private async handleConsecutiveAbsences(enrollmentId: string, tenantId: string, branchId: string | null) {
    // Get last 3 attendances for this enrollment
    const last3 = await this.prisma.attendance.findMany({
      where: { enrollment_id: enrollmentId },
      orderBy: { date: 'desc' },
      take: 3
    });

    // Check if all of them are ABSENT
    if (last3.length === 3 && last3.every(a => a.status === 'ABSENT')) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { student: true }
      });

      if (!enrollment || enrollment.status === 'FROZEN') return;

      // 1. Freeze Enrollment
      await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'FROZEN' }
      });

      // 2. Add to Call Center Tasks
      await this.prisma.callCenterTask.create({
        data: {
          tenant_id: tenantId,
          branch_id: branchId,
          student_id: enrollment.student_id,
          type: 'ABSENTEE',
          status: 'PENDING',
          note: 'Ketma-ket 3 kun dars qoldirdi. Avtomatik muzlatildi.'
        }
      });
      
      // 3. Update Student Global Status if necessary (Optional check)
      // If all active enrollments are now frozen/archived, set student to FROZEN
      const otherEnrollments = await this.prisma.enrollment.findMany({
        where: { student_id: enrollment.student_id, status: 'ACTIVE', NOT: { id: enrollmentId } }
      });

      if (otherEnrollments.length === 0) {
        await this.prisma.student.update({
          where: { id: enrollment.student_id },
          data: { status: 'FROZEN' }
        });
      }
    }
  }


  async getAttendanceAnalytics(tenantId: string, branchId?: string, startDate?: string, endDate?: string) {
    const where: any = { 
        enrollment: { 
            group: { 
                tenant_id: tenantId,
                branch_id: branchId && branchId !== 'all' ? branchId : undefined
            } 
        } 
    };

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const [totalRecords, presentCount, unexcusedCount, attendanceTrend, groupStats, genderStats] = await Promise.all([
      this.prisma.attendance.count({ where: { ...where, date: { gte: start, lte: end } } }),
      this.prisma.attendance.count({ where: { ...where, date: { gte: start, lte: end }, status: { in: ['PRESENT', 'LATE'] } } }),
      this.prisma.attendance.count({ where: { ...where, date: { gte: start, lte: end }, status: 'ABSENT' } }),
      this.getAttendanceTrend(where, start, end),
      this.getTopPerformingGroups(tenantId, branchId, start, end),
      this.getGenderAttendance(tenantId, branchId, start, end)
    ]);

    const overallRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    return {
      stats: {
        overall: `${overallRate}%`,
        unexcused: unexcusedCount,
        total: totalRecords,
        bestGroup: groupStats[0] || null,
        worstGroup: groupStats[groupStats.length - 1] || null,
        gender: genderStats
      },
      trend: attendanceTrend
    };
  }

  private async getTopPerformingGroups(tenantId: string, branchId: string | undefined, start: Date, end: Date) {
    const groups = await this.prisma.group.findMany({
      where: { 
        tenant_id: tenantId, 
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        is_archived: false 
      },
      include: {
        enrollments: {
          include: {
            attendances: {
              where: { date: { gte: start, lte: end } }
            }
          }
        }
      }
    });

    const groupRates = groups.map(g => {
      let total = 0;
      let present = 0;
      g.enrollments.forEach(e => {
        total += e.attendances.length;
        present += e.attendances.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length;
      });
      return { 
        name: g.name, 
        rate: total > 0 ? Math.round((present / total) * 100) : 0 
      };
    }).filter(g => g.rate > 0);

    return groupRates.sort((a, b) => b.rate - a.rate);
  }

  private async getGenderAttendance(tenantId: string, branchId: string | undefined, start: Date, end: Date) {
    const [boys, girls] = await Promise.all([
      this.getRateByGender(tenantId, branchId, start, end, 'Erkak'),
      this.getRateByGender(tenantId, branchId, start, end, 'Ayol')
    ]);
    return { boys, girls };
  }

  private async getRateByGender(tenantId: string, branchId: string | undefined, start: Date, end: Date, gender: string) {
    const where: any = {
      enrollment: {
        student: { user: { gender } },
        group: { 
          tenant_id: tenantId, 
          branch_id: branchId && branchId !== 'all' ? branchId : undefined 
        }
      },
      date: { gte: start, lte: end }
    };
    
    const [total, present] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.count({ where: { ...where, status: { in: ['PRESENT', 'LATE'] } } })
    ]);

    return total > 0 ? Math.round((present / total) * 100) : 0;
  }

  private async getAttendanceTrend(baseWhere: any, start: Date, end: Date) {
    const diff = end.getTime() - start.getTime();
    const segments = 8;
    const step = diff / segments;
    const trend: any[] = [];
    for (let i = 0; i < segments; i++) {
        const s = new Date(start.getTime() + (i * step));
        const e = new Date(start.getTime() + ((i + 1) * step));
        const [keldi, kelmadi] = await Promise.all([
          this.prisma.attendance.count({ where: { ...baseWhere, date: { gte: s, lte: e }, status: { in: ['PRESENT', 'LATE'] } } }),
          this.prisma.attendance.count({ where: { ...baseWhere, date: { gte: s, lte: e }, status: 'ABSENT' } }),
        ]);
        trend.push({ 
          week: s.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }), 
          keldi, 
          kelmadi 
        });
    }
    return trend;
  }
}
