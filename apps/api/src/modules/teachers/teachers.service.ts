// @ts-nocheck
import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async getTeachers(tenantId: string, branchId?: string, query?: any) {
    const whereClause: any = { 
      tenant_id: tenantId,
    };

    // Default to non-archived teachers
    if (query?.is_archived === 'true') {
      whereClause.is_archived = true;
    } else {
      whereClause.is_archived = false;
    }
    
    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
    }

    if (query?.search || query?.phone) {
      whereClause.user = {
        ...whereClause.user,
        AND: [
          query.search ? {
            OR: [
              { first_name: { contains: query.search, mode: 'insensitive' } },
              { last_name: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
            ]
          } : {},
          query.phone ? { phone: { contains: query.phone } } : {}
        ]
      };
    }

    if (query?.salary_type && query.salary_type !== 'all') {
      whereClause.salary_type = query.salary_type;
    }

    if (query?.group_id && query.group_id !== 'all') {
      whereClause.OR = [
        { taughtGroups: { some: { id: query.group_id } } },
        { supportedGroups: { some: { id: query.group_id } } }
      ];
    }

    if (query?.type && query.type !== 'all') {
      whereClause.type = query.type;
    }

    return this.prisma.teacher.findMany({
      where: whereClause,
      include: { 
        user: { include: { role: true } },
        branch: true,
        taughtGroups: { include: { course: true, _count: { select: { enrollments: true } } } },
        supportedGroups: { include: { course: true, _count: { select: { enrollments: true } } } },
      },
      orderBy: { joined_at: 'desc' }
    });
  }

  async getTeacherStats(tenantId: string, branchId?: string) {
    const whereClause: any = { tenant_id: tenantId, is_archived: false };
    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
    }

    const [typeStats, total, departments, teachersWithDetails] = await Promise.all([
      this.prisma.teacher.groupBy({
        by: ['type'],
        where: whereClause,
        _count: { _all: true }
      }),
      this.prisma.teacher.count({ where: whereClause }),
      this.prisma.teacher.groupBy({
        by: ['specialization'],
        where: whereClause,
        _count: { _all: true }
      }),
      this.prisma.teacher.findMany({
        where: whereClause,
        select: {
          id: true,
          user_id: true,
          user: { select: { first_name: true, last_name: true } },
        }
      })
    ]);

    const main = typeStats.find(s => s.type === 'MAIN')?._count._all || 0;
    const support = typeStats.find(s => s.type === 'SUPPORT')?._count._all || 0;
    const interns = typeStats.find(s => s.type === 'INTERN')?._count._all || 0;

    const departmentStats = departments.map(d => ({
      name: d.specialization || 'General',
      value: d._count._all,
      percent: Math.round((d._count._all / total) * 100) || 0
    })).sort((a, b) => b.value - a.value);

    // 1. Calculate Academic Performance
    const academicSuccessData = await this.prisma.attendance.groupBy({
      by: ['marked_by'],
      where: {
        enrollment: { 
          group: { 
            tenant_id: tenantId, 
            branch_id: branchId === 'all' ? undefined : branchId,
            is_archived: false 
          } 
        },
        score: { not: null }
      },
      _avg: { score: true }
    });

    const academicSuccess = academicSuccessData
      .map(data => {
        const teacher = teachersWithDetails.find(t => t.user_id === data.marked_by);
        if (!teacher) return null;
        return {
          id: teacher.id,
          name: `${teacher.user.first_name} ${teacher.user.last_name?.charAt(0) || ''}`,
          avgGrade: Math.round((data._avg.score || 0) * 10)
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.avgGrade - a!.avgGrade)
      .slice(0, 10);

    // 2. Calculate Monthly Attendance Trend
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const allAttendanceInRange = await this.prisma.attendance.findMany({
      where: {
        enrollment: { group: { tenant_id: tenantId, branch_id: branchId === 'all' ? undefined : branchId } },
        date: { gte: sixMonthsAgo }
      },
      select: { date: true, status: true }
    });

    const attendanceTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      const monthData = allAttendanceInRange.filter(a => a.date >= start && a.date <= end);
      const tCount = monthData.length;
      const pCount = monthData.filter(a => a.status === 'PRESENT').length;

      attendanceTrend.push({
        month: d.toLocaleString('uz-UZ', { month: 'short' }),
        rate: tCount > 0 ? Math.round((pCount / tCount) * 100) : 0
      });
    }

    return { total, main, support, interns, departmentStats, academicSuccess, attendanceTrend };

    return { total, main, support, interns, departmentStats, academicSuccess, attendanceTrend };
  }

  async createTeacher(tenantId: string, data: any) {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingUser) throw new HttpException('Bu telefon raqami bilan foydalanuvchi mavjud', 400);

      const roleSlug = data.role === 'SUPPORT_TEACHER' ? 'SUPPORT_TEACHER' : 'TEACHER';
      let teacherRole = await this.prisma.role.findUnique({ where: { slug: roleSlug.toLowerCase() } });
      
      if (!teacherRole) {
        teacherRole = await this.prisma.role.create({
          data: {
            name: roleSlug === 'TEACHER' ? 'O\'qituvchi' : 'Yordamchi Ustoz',
            slug: roleSlug.toLowerCase(),
            permissions: ['LMS']
          }
        });
      }

      if (!data.password) {
         throw new HttpException("Parol kiritilishi shart", 400);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      return await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            tenant_id: tenantId,
            phone: data.phone,
            email: data.email || null,
            first_name: data.firstName,
            last_name: data.lastName,
            password_hash: hashedPassword,
            role_id: teacherRole!.id,
            gender: data.gender || null,
            photo_url: data.photoUrl || null,
            branches: data.branchId 
              ? { connect: [{ id: data.branchId }] } 
              : (data.branchIds && data.branchIds.length > 0) 
                ? { connect: data.branchIds.map((id: string) => ({ id })) } 
                : undefined
          }
        });

        const teacher = await prisma.teacher.create({
          data: {
            tenant_id: tenantId,
            user_id: user.id,
            branch_id: data.branchId || (data.branchIds && data.branchIds.length > 0 ? data.branchIds[0] : null),
            specialization: data.specialization || '',
            salary_type: data.salaryType || 'FIXED',
            salary_amount: Number(data.salaryAmount) || 0,
            type: data.type || 'MAIN',
            joined_at: new Date(),
            date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            description: data.description || ''
          },
          include: { user: true }
        });

        return teacher;
      });
    } catch (err: any) {
      console.error(err);
      throw new HttpException(err.message || 'Ustoz yaratishda xatolik', err.status || 500);
    }
  }

  async getTeacherById(tenantId: string, id: string, branchId?: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const whereClause: any = { id, tenant_id: tenantId };
    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
    }

    const teacher = await this.prisma.teacher.findUnique({
      where: whereClause,
      include: { 
        user: { include: { role: true } }, 
        branch: true,
        performance: true,
        feedbacks: { include: { student: { include: { user: true } } }, orderBy: { created_at: 'desc' }, take: 10 },
        taughtGroups: { 
          where: { is_archived: false },
          include: { 
            course: true, 
            room: true,
            schedules: { include: { room: true } },
            _count: { select: { enrollments: true } }
          } 
        },
        penalties: { 
          where: {
            created_at: {
              gte: new Date(targetYear, targetMonth, 1),
              lte: new Date(targetYear, targetMonth + 1, 0)
            }
          },
          include: { group: true }, 
          orderBy: { created_at: 'desc' } 
        },
        supportedGroups: { 
          where: { is_archived: false },
          include: { 
            course: true, 
            room: true,
            schedules: { include: { room: true } },
            _count: { select: { enrollments: true } }
          } 
        }
      }
    });

    if (!teacher) throw new NotFoundException('Ustoz topilmadi');

    const upcomingClasses = this.calculateUpcomingClasses(teacher);
    const workloadStats = this.calculateWorkloadStats(teacher);
    const weeklySchedule = this.calculateWeeklySchedule(teacher);
    const financialSummary = await this.calculateFinancialSummary(tenantId, teacher, targetMonth, targetYear);
    const performance = await this.calculatePerformanceMetrics(tenantId, teacher, targetMonth, targetYear);
    const calendarData = await this.calculateCalendarData(tenantId, teacher, targetMonth, targetYear);
    const currentClasses = this.calculateCurrentClasses(teacher);

    return {
      ...teacher,
      upcomingClasses,
      workloadStats,
      weeklySchedule,
      financialSummary,
      performance,
      calendarData,
      currentClasses
    };
  }

  async markTeacherAttendance(tenantId: string, data: any) {
    return this.prisma.teacherAttendance.upsert({
      where: {
        teacher_id_schedule_id_date: {
          teacher_id: data.teacher_id,
          schedule_id: data.schedule_id,
          date: new Date(data.date)
        }
      },
      update: {
        status: data.status,
        late_minutes: Number(data.late_minutes || 0),
        note: data.note || null
      },
      create: {
        tenant_id: tenantId,
        teacher_id: data.teacher_id,
        schedule_id: data.schedule_id,
        date: new Date(data.date),
        status: data.status,
        late_minutes: Number(data.late_minutes || 0),
        note: data.note || null
      }
    });
  }

  private calculateUpcomingClasses(teacher: any) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) to 6 (Sat)
    // Map JS 0-6 to our DB day_of_week if different (usually 0 is Mon, 6 is Sun?)
    // In our system, let's assume 1-Mon, 7-Sun or 0-6. Let's check schema.
    
    const allSchedules: any[] = [];
    [...teacher.taughtGroups, ...teacher.supportedGroups].forEach(group => {
      group.schedules.forEach((s: any) => {
        allSchedules.push({ ...s, groupName: group.name, roomName: s.room?.name || group.room?.name || 'Xonasiz' });
      });
    });

    // Sort and find top 3
    const upcoming = allSchedules
      .map(s => {
        // Simple logic for "minutes left" on current day
        if (s.day_of_week === currentDay) {
          const [h, m] = s.start_time.split(':').map(Number);
          const startMinutes = h * 60 + m;
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const diff = startMinutes - currentMinutes;
          return { ...s, diff };
        }
        return { ...s, diff: Infinity };
      })
      .filter(s => s.diff > 0 && s.diff !== Infinity)
      .sort((a,b) => a.diff - b.diff)
      .slice(0, 3);

    return upcoming;
  }

  private calculateWorkloadStats(teacher: any) {
    const hoursPerDay = new Array(7).fill(0);
    [...teacher.taughtGroups, ...teacher.supportedGroups].forEach(group => {
      group.schedules.forEach((s: any) => {
        const [sh, sm] = s.start_time.split(':').map(Number);
        const [eh, em] = s.end_time.split(':').map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);
        hoursPerDay[s.day_of_week] += duration / 60;
      });
    });

    return [
      { name: 'Du', value: hoursPerDay[1] || 0 },
      { name: 'Se', value: hoursPerDay[2] || 0 },
      { name: 'Ch', value: hoursPerDay[3] || 0 },
      { name: 'Pa', value: hoursPerDay[4] || 0 },
      { name: 'Ju', value: hoursPerDay[5] || 0 },
      { name: 'Sh', value: hoursPerDay[6] || 0 },
      { name: 'Ya', value: hoursPerDay[0] || 0 },
    ];
  }

  private calculateWeeklySchedule(teacher: any) {
    const days = ['du', 'se', 'ch', 'pa', 'ju', 'sh', 'ya'];
    const scheduleGrid: any[] = [];
    
    const timeSlots = new Set<string>();
    [...teacher.taughtGroups, ...teacher.supportedGroups].forEach(group => {
      group.schedules.forEach((s: any) => timeSlots.add(s.start_time));
    });

    Array.from(timeSlots).sort().forEach(time => {
      const row: any = { time };
      [...teacher.taughtGroups, ...teacher.supportedGroups].forEach(group => {
        group.schedules.forEach((s: any) => {
          if (s.start_time === time) {
            const dayIdx = s.day_of_week === 0 ? 6 : s.day_of_week - 1;
            const dayKey = days[dayIdx];
            row[dayKey] = group.name;
          }
        });
      });
      scheduleGrid.push(row);
    });

    return scheduleGrid;
  }

  private async calculateFinancialSummary(tenantId: string, teacher: any, month: number, year: number) {
    const totalSalary = Number(teacher.salary_amount || 0);
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const bonuses = await this.prisma.bonus.aggregate({
      where: { 
        teacher_id: teacher.id, 
        tenant_id: tenantId,
        created_at: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    });
    const penalties = await this.prisma.penalty.aggregate({
      where: { 
        teacher_id: teacher.id, 
        tenant_id: tenantId,
        created_at: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    });

    const bonusTotal = Number(bonuses._sum.amount || 0);
    const penaltyTotal = Number(penalties._sum.amount || 0);

    return {
      totalSalary,
      bonusTotal,
      penaltyTotal,
      netPay: totalSalary + bonusTotal - penaltyTotal
    };
  }

  private async calculatePerformanceMetrics(tenantId: string, teacher: any, month: number, year: number) {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // Parallelize all metric queries
    const [attendances, avgGradeData, studentAttTotal, studentAttPresent, activeEnrollments, droppedEnrollments] = await Promise.all([
      this.prisma.teacherAttendance.findMany({
        where: { teacher_id: teacher.id, tenant_id: tenantId, date: { gte: startOfMonth, lte: endOfMonth } },
        select: { status: true, late_minutes: true }
      }),
      this.prisma.grade.aggregate({
        where: { exam: { group: { teacher_id: teacher.id } }, created_at: { gte: startOfMonth, lte: endOfMonth } },
        _avg: { score: true }
      }),
      this.prisma.attendance.count({
        where: { schedule: { group: { teacher_id: teacher.id } }, date: { gte: startOfMonth, lte: endOfMonth } }
      }),
      this.prisma.attendance.count({
        where: { schedule: { group: { teacher_id: teacher.id } }, status: 'PRESENT', date: { gte: startOfMonth, lte: endOfMonth } }
      }),
      this.prisma.enrollment.count({
        where: { group: { teacher_id: teacher.id }, status: 'ACTIVE' }
      }),
      this.prisma.enrollment.count({
        where: { group: { teacher_id: teacher.id }, status: 'DROPPED', updated_at: { gte: startOfMonth, lte: endOfMonth } }
      })
    ]);

    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const punctuality = total > 0 ? Math.round((present / total) * 100) : null;
    const avgLateness = total > 0 
      ? Math.round(attendances.reduce((acc, curr) => acc + curr.late_minutes, 0) / total) 
      : null;

    return {
      punctuality,
      avg_lateness: avgLateness,
      avg_grade: avgGrade._avg.score ? Math.round(avgGrade._avg.score) : null,
      attendance_rate: totalStudentAttendance > 0 ? Math.round((studentAttendance / totalStudentAttendance) * 100) : null,
      retention_rate: retentionRate
    };
  }

  private async calculateCalendarData(tenantId: string, teacher: any, month: number, year: number) {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const attendances = await this.prisma.teacherAttendance.findMany({
      where: {
        teacher_id: teacher.id,
        tenant_id: tenantId,
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      select: { date: true, status: true }
    });

    const calendar: any = {};
    attendances.forEach(a => {
      const day = new Date(a.date).getDate();
      calendar[day] = a.status;
    });

    return {
      month,
      year,
      days: calendar,
      stats: {
        present: attendances.filter(a => a.status === 'PRESENT').length,
        late: attendances.filter(a => a.status === 'LATE').length,
        absent: attendances.filter(a => a.status === 'ABSENT').length
      }
    };
  }

  private calculateCurrentClasses(teacher: any) {
    const groups = [...teacher.taughtGroups, ...teacher.supportedGroups];
    const names = Array.from(new Set(groups.map(g => g.name)));
    return names;
  }

  async updateTeacher(tenantId: string, id: string, data: any) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id, tenant_id: tenantId },
      include: { user: true }
    });
    if (!teacher) throw new NotFoundException('Ustoz topilmadi');

    return await this.prisma.$transaction(async (prisma) => {
      if (data.phone && data.phone !== teacher.user.phone) {
        const existingUser = await prisma.user.findFirst({
          where: { phone: data.phone, NOT: { id: teacher.user_id } }
        });
        if (existingUser) throw new HttpException('Bu telefon raqami band', 400);
      }

      let password_hash = teacher.user.password_hash;
      if (data.password) {
        password_hash = await bcrypt.hash(data.password, 10);
      }

      // Update User
      await prisma.user.update({
        where: { id: teacher.user_id },
        data: {
          first_name: data.firstName || undefined,
          last_name: data.lastName || undefined,
          phone: data.phone || undefined,
          email: data.email !== undefined ? data.email : undefined,
          password_hash,
          is_active: data.is_active !== undefined ? data.is_active : undefined,
          gender: data.gender || undefined,
          photo_url: data.photoUrl || undefined,
          branches: data.branchId 
            ? { set: [{ id: data.branchId }] }
            : data.branchIds 
              ? { set: data.branchIds.map((bid: string) => ({ id: bid })) } 
              : undefined
        }
      });

      // Update Teacher Profile
      return prisma.teacher.update({
        where: { id },
        data: {
          specialization: data.specialization || undefined,
          salary_type: data.salaryType || undefined,
          salary_amount: data.salaryAmount !== undefined ? Number(data.salaryAmount) : undefined,
          type: data.type || undefined,
          branch_id: data.branchId || (data.branchIds?.[0]) || undefined,
          date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          description: data.description || undefined
        },
        include: { user: { include: { role: true } }, branch: true }
      });
    });
  }

  async checkTeacherGroups(teacherId: string) {
    const groups = await this.prisma.group.findMany({
      where: {
        OR: [
          { teacher_id: teacherId },
          { support_teacher_id: teacherId }
        ],
        is_archived: false,
        status: 'ACTIVE'
      },
      include: {
        course: true
      }
    });

    return groups.map(g => ({
      id: g.id,
      name: g.name,
      course_name: g.course.name,
      role: g.teacher_id === teacherId ? 'MAIN' : 'SUPPORT'
    }));
  }

  async deleteTeacher(tenantId: string, id: string, reassignmentData?: any) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id, tenant_id: tenantId },
    });
    if (!teacher) throw new NotFoundException('Ustoz topilmadi');

    const activeGroups = await this.checkTeacherGroups(id);
    
    if (activeGroups.length > 0 && !reassignmentData) {
      throw new HttpException({
        message: 'O\'qituvchining faol guruhlari bor. Ularni boshqa o\'qituvchiga biriktirishingiz kerak.',
        groups: activeGroups
      }, 400);
    }

    return this.prisma.$transaction(async (prisma) => {
      // 1. Reassign groups if data provided
      if (reassignmentData) {
        for (const groupId in reassignmentData) {
          const newTeacherId = reassignmentData[groupId];
          const group = activeGroups.find(g => g.id === groupId);
          
          if (group) {
            if (group.role === 'MAIN') {
              await prisma.group.update({
                where: { id: groupId },
                data: { teacher_id: newTeacherId }
              });
            } else {
              await prisma.group.update({
                where: { id: groupId },
                data: { support_teacher_id: newTeacherId }
              });
            }
          }
        }
      }

      // 2. Cascade delete dependent historical records not covered by schema cascade
      // (Some relations in schema already have onDelete: Cascade)
      
      // Delete historical records that might block deletion
      await prisma.bonus.deleteMany({ where: { teacher_id: id } });
      await prisma.penalty.deleteMany({ where: { teacher_id: id } });
      await prisma.payroll.deleteMany({ where: { teacher_id: id } });

      const teacher_user_id = teacher.user_id;
      await prisma.teacher.delete({ where: { id } });
      await prisma.user.delete({ where: { id: teacher_user_id } });
    });
  }

  async archiveTeacher(tenantId: string, id: string, reason: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id, tenant_id: tenantId }
    });
    if (!teacher) throw new NotFoundException('Ustoz topilmadi');

    return this.prisma.teacher.update({
      where: { id },
      data: {
        is_archived: true,
        archive_reason: reason,
        archived_at: new Date()
      }
    });
  }

  async restoreTeacher(tenantId: string, id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id, tenant_id: tenantId }
    });
    if (!teacher) throw new NotFoundException('Ustoz topilmadi');

    return this.prisma.teacher.update({
      where: { id },
      data: {
        is_archived: false,
        archive_reason: null,
        archived_at: null
      }
    });
  }

  async getArchiveStats(tenantId: string, branchId?: string) {
    const whereClause: any = {
      tenant_id: tenantId,
      is_archived: true,
    };

    const activeWhereClause: any = {
      tenant_id: tenantId,
      is_archived: false,
    };

    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
      activeWhereClause.branch_id = branchId;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalArchive, totalActive, recent] = await Promise.all([
      this.prisma.teacher.count({ where: whereClause }),
      this.prisma.teacher.count({ where: activeWhereClause }),
      this.prisma.teacher.count({
        where: {
          ...whereClause,
          archived_at: { gte: sevenDaysAgo }
        }
      })
    ]);

    return {
      totalArchive,
      totalActive,
      recent,
      older: totalArchive - recent
    };
  }

  async getArchiveReasons(tenantId: string) {
    return this.prisma.teacherArchiveReason.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'asc' }
    });
  }

  async createArchiveReason(tenantId: string, name: string) {
    return this.prisma.teacherArchiveReason.create({
      data: { tenant_id: tenantId, name }
    });
  }

  async getSpecializations(tenantId: string) {
    return this.prisma.teacherSpecialization.findMany({
      where: { tenant_id: tenantId },
      orderBy: { name: 'asc' }
    });
  }

  async createSpecialization(tenantId: string, name: string) {
    return this.prisma.teacherSpecialization.create({
      data: { tenant_id: tenantId, name }
    });
  }

  async bulkCreateTeachers(tenantId: string, data: { branchId: string, teachers: any[] }) {
    const { branchId, teachers } = data;

    return await this.prisma.$transaction(async (prisma) => {
      // 1. Get or create TEACHER role
      let teacherRole = await prisma.role.findUnique({ where: { slug: 'teacher' } });
      if (!teacherRole) {
        teacherRole = await prisma.role.create({
          data: { name: 'O\'qituvchi', slug: 'teacher', permissions: ['LMS'] }
        });
      }

      // 1. Parallel hashing and user creation
      const processedTeachers = await Promise.all(teachers.map(async (t) => {
        try {
          const existing = await prisma.user.findUnique({ where: { phone: t.phone } });
          if (existing) {
            return { success: false, error: `Foydalanuvchi mavjud: ${t.phone}` };
          }

          const hashedPassword = await bcrypt.hash(t.password || '123456', 10);
          
          const user = await prisma.user.create({
            data: {
              tenant_id: tenantId,
              phone: t.phone,
              password_hash: hashedPassword,
              first_name: t.firstName,
              last_name: t.lastName || '',
              role_id: teacherRole.id,
              is_active: true,
              branches: {
                connect: branchId !== 'all' ? [{ id: branchId }] : []
              }
            }
          });

          await prisma.teacher.create({
            data: {
              tenant_id: tenantId,
              user_id: user.id,
              branch_id: branchId !== 'all' ? branchId : null,
              specialization: t.specialization || '',
              salary_type: t.salaryType || 'FIXED',
              salary_amount: Number(t.salaryAmount) || 0,
              type: t.type || 'MAIN',
              joined_at: new Date()
            }
          });

          return { success: true };
        } catch (e: any) {
          return { success: false, error: `Xatolik (${t.firstName}): ${e.message}` };
        }
      }));

      const successCount = processedTeachers.filter(r => r.success).length;
      const errors = processedTeachers.filter(r => !r.success).map(r => r.error);

      return {
        success: true,
        count: successCount,
        errors
      };
    });
  }
}
