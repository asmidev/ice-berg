import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class StaffAttendanceService {
  constructor(private prisma: PrismaService) {}

  async getStaffAttendance(tenantId: string, branchId: string, date: string) {
    const targetDate = new Date(date);
    
    // 1. Fetch all active staff
    const staff = await this.prisma.staff.findMany({
      where: {
        tenant_id: tenantId,
        ...(branchId !== 'all' ? { branch_id: branchId } : {}),
        user: { is_active: true }
      },
      include: {
        user: true,
        attendances: {
          where: { date: targetDate }
        }
      }
    });

    return staff.map(s => ({
      id: s.id,
      name: `${s.user.first_name} ${s.user.last_name}`,
      phone: s.user.phone,
      position: s.position,
      attendance: s.attendances[0] || null
    }));
  }

  async markStaffAttendance(tenantId: string, data: any) {
    const { staffId, branchId, date, status, delayTime, note } = data;
    const targetDate = new Date(date);

    return this.prisma.staffAttendance.upsert({
      where: {
        staff_id_date: {
          staff_id: staffId,
          date: targetDate
        }
      },
      update: {
        status,
        delay_time: delayTime || 0,
        note
      },
      create: {
        tenant_id: tenantId,
        staff_id: staffId,
        branch_id: branchId !== 'all' ? branchId : null,
        date: targetDate,
        status,
        delay_time: delayTime || 0,
        note
      }
    });
  }

  async getTeacherAttendance(tenantId: string, branchId: string, date: string) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday...

    // 1. Find all teachers who have lessons on this day of week
    const teachers = await this.prisma.teacher.findMany({
      where: {
        tenant_id: tenantId,
        ...(branchId !== 'all' ? { branch_id: branchId } : {}),
        is_archived: false,
        user: { is_active: true },
        taughtGroups: {
          some: {
            schedules: {
              some: { day_of_week: dayOfWeek }
            }
          }
        }
      },
      include: {
        user: true,
        taughtGroups: {
          include: {
            schedules: {
              where: { day_of_week: dayOfWeek }
            }
          }
        },
        attendances: {
          where: { date: targetDate }
        }
      }
    });

    return teachers.map(t => {
      // For daily view, we check if they have at least one attendance marked for today
      // Or we can return the overall status
      const todayAttendances = t.attendances;
      
      const todayAttendance = todayAttendances.length > 0 ? todayAttendances[0] : null;
      
      return {
        id: t.id,
        name: `${t.user.first_name} ${t.user.last_name}`,
        phone: t.user.phone,
        specialization: t.specialization,
        lessons_count: t.taughtGroups.reduce((acc, g) => acc + g.schedules.length, 0),
        attendance: todayAttendance ? {
          ...todayAttendance,
          delay_time: (todayAttendance as any).late_minutes // Map for frontend consistency
        } : null 
      };
    });
  }

  async markTeacherAttendanceDaily(tenantId: string, data: any) {
    const { teacherId, date, status, delayTime, note } = data;
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // 1. Get all schedules for this teacher on this day
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        taughtGroups: {
          include: {
            schedules: {
              where: { day_of_week: dayOfWeek }
            }
          }
        }
      }
    });

    if (!teacher) return null;

    const schedules = teacher.taughtGroups.flatMap(g => g.schedules);

    // 2. Mark attendance for each schedule
    // In this repo, TeacherAttendance is linked to schedule_id
    const operations = schedules.map(s => 
      this.prisma.teacherAttendance.upsert({
        where: {
          teacher_id_schedule_id_date: {
            teacher_id: teacherId,
            schedule_id: s.id,
            date: targetDate
          }
        },
        update: {
          status,
          late_minutes: delayTime || 0,
          note
        },
        create: {
          tenant_id: tenantId,
          teacher_id: teacherId,
          schedule_id: s.id,
          date: targetDate,
          status,
          late_minutes: delayTime || 0,
          note
        }
      })
    );

    const results = await Promise.all(operations);
    return results.map(r => ({ ...r, delay_time: (r as any).late_minutes }));
  }

  async getAttendanceStats(tenantId: string, branchId: string, date: string) {
    const targetDate = new Date(date);
    const whereStaff: any = { tenant_id: tenantId, date: targetDate };
    const whereTeacher: any = { tenant_id: tenantId, date: targetDate };
    
    if (branchId !== 'all') {
      whereStaff.branch_id = branchId;
      // TeacherAttendance doesn't have direct branch_id, but linked to teacher
      whereTeacher.teacher = { branch_id: branchId };
    }

    const [staffStats, teacherStats] = await Promise.all([
      this.prisma.staffAttendance.groupBy({
        by: ['status'],
        where: whereStaff,
        _count: true
      }),
      this.prisma.teacherAttendance.groupBy({
        by: ['status'],
        where: whereTeacher,
        _count: true
      })
    ]);

    return {
      staff: staffStats,
      teachers: teacherStats
    };
  }

  async getMonthlyAttendance(tenantId: string, type: 'staff' | 'teacher', personId: string, year: number, month: number) {
    // month is 1-indexed (1 = January)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    if (type === 'staff') {
      return this.prisma.staffAttendance.findMany({
        where: {
          tenant_id: tenantId,
          staff_id: personId,
          date: { gte: startDate, lte: endDate }
        }
      });
    } else {
      // For teachers, we group by date since they can have multiple schedules per day
      const attendances = await this.prisma.teacherAttendance.findMany({
        where: {
          tenant_id: tenantId,
          teacher_id: personId,
          date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'asc' }
      });
      // Return distinct dates (or at least first record per date)
      const uniqueByDate = [];
      const seenDates = new Set();
      for (const att of attendances) {
        const dateStr = att.date.toISOString().split('T')[0];
        if (!seenDates.has(dateStr)) {
          seenDates.add(dateStr);
          uniqueByDate.push(att);
        }
      }
      return uniqueByDate.map(att => ({ ...att, delay_time: (att as any).late_minutes }));
    }
  }
}
