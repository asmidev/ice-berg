import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { DiscountsService } from '../discounts/discounts.service';

@Injectable()
export class LmsService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
    private discountsService: DiscountsService
  ) {}

  async createCourse(tenantId: string, data: any) {
    if (!data.branch_id || data.branch_id === 'all') {
      throw new HttpException('Yo\'nalish yaratish uchun filialni tanlash majburiy', 400);
    }
    return this.prisma.course.create({
      data: { 
        name: data.name,
        description: data.description || '',
        tenant_id: tenantId,
        branch_id: data.branch_id
      },
    });
  }

  async getCourses(tenantId: string, branchId?: string) {
    const whereClause: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
    }
    return this.prisma.course.findMany({ 
      where: whereClause, 
      include: { 
        _count: { 
          select: { 
            groups: { where: { is_archived: false } } 
          } 
        },
        groups: {
          where: { is_archived: false },
          select: {
            _count: {
              select: { enrollments: { where: { status: 'ACTIVE' } } }
            }
          }
        }
      } 
    });
  }

  async deleteCourse(tenantId: string, courseId: string) {
    return this.prisma.course.deleteMany({
      where: { id: courseId, tenant_id: tenantId }
    });
  }

  async getLmsStats(tenantId: string, branchId?: string) {
    const whereClause: any = { tenant_id: tenantId };
    const branchWhere: any = { tenant_id: tenantId };
    
    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
      branchWhere.branch_id = branchId;
    }

    const [totalGroups, totalRooms, activeCourses, studentCount] = await Promise.all([
      this.prisma.group.count({ where: { ...whereClause, is_archived: false } }),
      this.prisma.room.count({ where: branchWhere }),
      this.prisma.course.count({ 
        where: { 
          tenant_id: tenantId,
          groups: { some: { is_archived: false, ...whereClause } }
        } 
      }),
      this.prisma.student.count({
        where: {
          ...branchWhere,
          is_archived: false,
          status: 'ACTIVE'
        }
      })
    ]);

    return {
      totalGroups,
      totalRooms,
      activeCourses,
      activeStudents: studentCount
    };
  }

  async createGroup(tenantId: string, data: any) {
    const supportTeacherId = data.support_teacher_id || data.supportTeacherId;
    const teacherId = data.teacher_id || data.teacherId;
    const roomId = data.room_id || data.roomId;
    const courseId = data.course_id || data.courseId;
    const branchId = data.branch_id || data.branchId || null;
    const schedules = data.schedules || [];

    // Conflict Check
    await this.validateSchedule(tenantId, branchId, schedules, teacherId, supportTeacherId);

    return this.prisma.$transaction(async (prisma) => {
      const group = await prisma.group.create({
        data: { 
          tenant_id: tenantId,
          branch_id: data.branch_id || data.branchId || null,
          course_id: courseId === 'none' ? null : courseId,
          teacher_id: teacherId === 'none' ? null : teacherId,
          support_teacher_id: supportTeacherId === 'none' ? null : (supportTeacherId || null),
          room_id: roomId === 'none' ? null : (roomId || null),
          name: data.name,
          capacity: Number(data.capacity) || 15,
          price: Number(data.price?.toString().replace(/,/g, '')) || 0,
          total_stages: Number(data.total_stages || data.totalStages) || 1,
          current_stage: Number(data.current_stage || data.currentStage) || 1,
          stage_duration_months: Number(data.stage_duration_months || data.stageDurationMonths) || 1,
          start_date: new Date(data.start_date || data.startDate),
          end_date: data.end_date ? new Date(data.end_date) : null,
          last_stage_at: new Date(),
          main_teacher_days: Number(data.main_teacher_days || data.mainTeacherDays) || 0,
          support_teacher_days: Number(data.support_teacher_days || data.supportTeacherDays) || 0,
          is_online: data.is_online === true || data.is_online === 'true' || data.isOnline === true,
          telegram_chat_id: data.telegram_chat_id || data.telegramChatId || null,
          description: data.description || null
        },
      });

      if (schedules.length > 0) {
        await prisma.schedule.createMany({
          data: schedules.map((s: any) => ({
            group_id: group.id,
            day_of_week: Number(s.day_of_week),
            start_time: s.start_time,
            end_time: s.end_time,
            room_id: (s.room_id === 'none' ? null : s.room_id) || roomId || null
          }))
        });
      }

      return group;
    });
  }

  async updateGroup(tenantId: string, id: string, data: any) {
    const supportTeacherId = data.support_teacher_id || data.supportTeacherId;
    const teacherId = data.teacher_id || data.teacherId;
    const roomId = data.room_id || data.roomId;
    const courseId = data.course_id || data.courseId;
    const branchId = data.branch_id || data.branchId || null;
    const schedules = data.schedules || [];

    // Conflict Check
    await this.validateSchedule(tenantId, branchId, schedules, teacherId, supportTeacherId, id);

    return this.prisma.$transaction(async (prisma) => {
      await prisma.group.updateMany({
        where: { id: id, tenant_id: tenantId },
        data: {
          branch_id: data.branch_id || data.branchId || null,
          course_id: courseId === 'none' ? null : courseId,
          teacher_id: teacherId === 'none' ? null : teacherId,
          support_teacher_id: supportTeacherId === 'none' ? null : (supportTeacherId || null),
          room_id: roomId === 'none' ? null : (roomId || null),
          name: data.name,
          capacity: Number(data.capacity) || 15,
          price: Number(data.price?.toString().replace(/,/g, '')) || 0,
          total_stages: Number(data.total_stages || data.totalStages) || 1,
          current_stage: Number(data.current_stage || data.currentStage) || 1,
          stage_duration_months: Number(data.stage_duration_months || data.stageDurationMonths) || 1,
          start_date: new Date(data.start_date || data.startDate),
          end_date: (data.end_date || data.endDate) ? new Date(data.end_date || data.endDate) : null,
          main_teacher_days: Number(data.main_teacher_days || data.mainTeacherDays) || 0,
          support_teacher_days: Number(data.support_teacher_days || data.supportTeacherDays) || 0,
          is_online: data.is_online === true || data.is_online === 'true' || data.isOnline === true,
          telegram_chat_id: data.telegram_chat_id || data.telegramChatId || null,
          description: data.description || null
        }
      });

      if (schedules.length > 0) {
        await prisma.schedule.deleteMany({ where: { group_id: id } });
        await prisma.schedule.createMany({
          data: schedules.map((s: any) => ({
            group_id: id,
            day_of_week: Number(s.day_of_week),
            start_time: s.start_time,
            end_time: s.end_time,
            room_id: (s.room_id === 'none' ? null : s.room_id) || roomId || null
          }))
        });
      }

      return { success: true };
    });
  }

  async getGroups(tenantId: string, branchId?: string, query?: any) {
    const whereClause: any = { 
      tenant_id: tenantId, 
      is_archived: false
    };

    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
    }

    if (query?.search) {
      whereClause.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query?.course_id && query.course_id !== 'all') {
      whereClause.course_id = query.course_id;
    }

    if (query?.teacher_id && query.teacher_id !== 'all') {
      whereClause.OR = [
        { teacher_id: query.teacher_id },
        { support_teacher_id: query.teacher_id }
      ];
    }

    if (query?.room_id && query.room_id !== 'all') {
      whereClause.room_id = query.room_id;
    }

    const monthStr = new Date().toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
    const formattedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

    return this.prisma.group.findMany({ 
      where: whereClause, 
      include: { 
        course: true, 
        branch: { select: { id: true, name: true } },
        teacher: { include: { user: { select: { id: true, first_name: true, last_name: true, photo_url: true } } } },
        support_teacher: { include: { user: { select: { id: true, first_name: true, last_name: true, photo_url: true } } } },
        _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
        schedules: { include: { room: true } },
        invoices: {
          where: {
            month: { contains: formattedMonth },
            status: 'PAID'
          },
          select: { id: true }
        }
      },
      orderBy: { start_date: 'desc' }
    });
  }

  async getGroupById(tenantId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, tenant_id: tenantId },
      include: {
        course: true,
        room: true,
        branch: { select: { id: true, name: true, settings: true } },
        teacher: { include: { user: { select: { id: true, first_name: true, last_name: true, photo_url: true, phone: true } } } },
        support_teacher: { include: { user: { select: { id: true, first_name: true, last_name: true, photo_url: true, phone: true } } } },
        schedules: { include: { room: true } },
        exams: { include: { grades: true } },
        assignments: { include: { submissions: true } },
        enrollments: {
          where: { status: { not: 'ARCHIVED' } },
          include: { 
             student: { 
               include: { 
                 user: { select: { id: true, first_name: true, last_name: true, photo_url: true, phone: true } },
                 invoices: {
                   where: { status: { in: ['UNPAID', 'PARTIAL'] } }
                 },
                 discounts: {
                   include: { discount: true }
                 }
               } 
             } 
          }
        }
      }
    });

    if (!group) throw new HttpException('Guruh topilmadi', 404);

    return group;
  }

  async updateGroupDescription(tenantId: string, groupId: string, description: string) {
    return this.prisma.group.update({
      where: { id: groupId, tenant_id: tenantId },
      data: { description }
    });
  }

  async nextStage(tenantId: string, groupId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, tenant_id: tenantId },
      include: {
        enrollments: { where: { status: 'ACTIVE' } }
      }
    });

    if (!group) throw new HttpException('Guruh topilmadi', 404);

    if (group.current_stage >= group.total_stages) {
      return this.prisma.group.update({
        where: { id: groupId, tenant_id: tenantId },
        data: { 
          is_archived: true, 
          archived_at: new Date(),
          archive_reason: 'Kurs yakunlandi'
        }
      });
    }

    const monthStr = new Date().toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
    const formattedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

    return this.prisma.$transaction(async (tx) => {
      // Yangi bosqichni belgilash
      const updatedGroup = await tx.group.update({
        where: { id: groupId, tenant_id: tenantId },
        data: { 
          current_stage: group.current_stage + 1,
          last_stage_at: new Date()
        }
      });

      // Barcha faol talabalarga qarz yozish
      for (const enr of group.enrollments) {
        // Skip if student or group is VIP
        const student = await tx.student.findUnique({ where: { id: enr.student_id } });
        if (student?.is_vip || updatedGroup.is_vip) {
          continue;
        }

        const discountedAmount = await this.discountsService.applyDiscounts(tenantId, enr.student_id, Number(group.price));

        await tx.invoice.create({
          data: {
            tenant_id: tenantId,
            branch_id: group.branch_id,
            student_id: enr.student_id,
            group_id: groupId,
            amount: discountedAmount,
            status: 'UNPAID',
            type: 'COURSE',
            month: `${formattedMonth} (${group.current_stage + 1}-bosqich)`,
            start_date: new Date(),
            end_date: new Date(new Date().setMonth(new Date().getMonth() + (group.stage_duration_months || 1)))
          }
        });

        await tx.student.update({
          where: { id: enr.student_id },
          data: { course_balance: { decrement: discountedAmount } }
        });
      }

      return updatedGroup;
    }, { timeout: 300000 });
  }

  async getTeachers(tenantId: string, branchId?: string) {
    const where: any = { 
      tenant_id: tenantId,
    };
    if (branchId && branchId !== 'all') {
      where.branch_id = branchId;
    }
    return this.prisma.teacher.findMany({
      where,
      include: { 
        user: { select: { id: true, first_name: true, last_name: true } }
      }
    });
  }

  async getArchivedGroups(tenantId: string, branchId?: string, query?: any) {
    const whereClause: any = { 
      tenant_id: tenantId, 
      is_archived: true 
    };
    
    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
    }

    if (query?.search) {
      whereClause.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query?.course_id && query.course_id !== 'all') {
      whereClause.course_id = query.course_id;
    }

    if (query?.teacher_id && query.teacher_id !== 'all') {
      whereClause.OR = [
        { teacher_id: query.teacher_id },
        { support_teacher_id: query.teacher_id }
      ];
    }

    if (query?.room_id && query.room_id !== 'all') {
      whereClause.room_id = query.room_id;
    }

    if (query?.reason && query.reason !== 'all') {
      whereClause.archive_reason = { contains: query.reason, mode: 'insensitive' };
    }

    return this.prisma.group.findMany({ 
      where: whereClause, 
      include: { 
        course: true, 
        branch: { select: { id: true, name: true } },
        teacher: { include: { user: { select: { id: true, first_name: true, last_name: true, photo_url: true } } } },
        support_teacher: { include: { user: { select: { id: true, first_name: true, last_name: true, photo_url: true } } } },
        _count: { select: { enrollments: true } },
        schedules: { include: { room: true } }
      },
      orderBy: { archived_at: 'desc' }
    });
  }

  async archiveGroup(tenantId: string, groupId: string, reason?: string) {
    return this.prisma.group.updateMany({
      where: { id: groupId, tenant_id: tenantId },
      data: { 
        is_archived: true,
        archived_at: new Date(),
        archive_reason: reason || 'Sababsiz'
      }
    });
  }

  async restoreGroup(tenantId: string, groupId: string) {
    return this.prisma.group.updateMany({
      where: { id: groupId, tenant_id: tenantId },
      data: { 
        is_archived: false,
        archived_at: null,
        archive_reason: null
      }
    });
  }

  async deleteGroup(tenantId: string, id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id, tenant_id: tenantId },
    });
    
    if (!group) throw new Error("Guruh topilmadi");

    try {
      await this.prisma.schedule.deleteMany({ where: { group_id: id } });
      return await this.prisma.group.delete({
        where: { id, tenant_id: tenantId },
      });
    } catch (err: any) {
      if (err.code === 'P2003') {
         throw new Error("Guruhga o'quvchilar yoki to'lovlar biriktirilganligi sababli o'chirib bo'lmaydi");
      }
      throw err;
    }
  }

  private async validateSchedule(tenantId: string, branchId: string | null, schedules: any[], teacherId: string | null, supportTeacherId: string | null, currentGroupId?: string) {
    const daysOfWeek = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

    for (const s of schedules) {
      const startTime = s.start_time;
      const endTime = s.end_time;
      const day = Number(s.day_of_week);
      const roomId = s.room_id || null;

      // 1. Room Conflict Check
      if (roomId && roomId !== 'none') {
        const roomConflict = await this.prisma.schedule.findFirst({
          where: {
            room_id: roomId,
            day_of_week: day,
            group: {
              tenant_id: tenantId,
              is_archived: false,
              ...(currentGroupId ? { id: { not: currentGroupId } } : {})
            },
            OR: [
              { AND: [{ start_time: { lte: startTime } }, { end_time: { gt: startTime } }] },
              { AND: [{ start_time: { lt: endTime } }, { end_time: { gte: endTime } }] },
              { AND: [{ start_time: { gte: startTime } }, { end_time: { lte: endTime } }] }
            ]
          },
          include: { group: true, room: true }
        });

        if (roomConflict) {
          throw new HttpException(
            `${roomConflict.room?.name || 'Xona'}da ${daysOfWeek[day]} kuni (${roomConflict.start_time}-${roomConflict.end_time}) "${roomConflict.group.name}" guruhi darsi bor.`,
            400
          );
        }
      }

      // 2. Teacher Conflict Check (Main & Support)
      const teachersToCheck = [teacherId, supportTeacherId].filter(id => id && id !== 'none');
      if (teachersToCheck.length > 0) {
        const teacherConflict = await this.prisma.schedule.findFirst({
          where: {
            day_of_week: day,
            group: {
              tenant_id: tenantId,
              is_archived: false,
              ...(currentGroupId ? { id: { not: currentGroupId } } : {}),
              OR: [
                { teacher_id: { in: teachersToCheck as string[] } },
                { support_teacher_id: { in: teachersToCheck as string[] } }
              ]
            },
            OR: [
              { AND: [{ start_time: { lte: startTime } }, { end_time: { gt: startTime } }] },
              { AND: [{ start_time: { lt: endTime } }, { end_time: { gte: endTime } }] },
              { AND: [{ start_time: { gte: startTime } }, { end_time: { lte: endTime } }] }
            ]
          },
          include: { 
            group: { 
              include: { 
                teacher: { include: { user: true } },
                support_teacher: { include: { user: true } }
              } 
            } 
          }
        });

        if (teacherConflict) {
          const confGroup = teacherConflict.group;
          let confTeacherName = "";
          if (teachersToCheck.includes(confGroup.teacher_id)) {
             confTeacherName = `${confGroup.teacher?.user?.first_name} ${confGroup.teacher?.user?.last_name}`;
          } else {
             confTeacherName = `${confGroup.support_teacher?.user?.first_name} ${confGroup.support_teacher?.user?.last_name}`;
          }

          throw new HttpException(
            `Ustoz ${confTeacherName}ning ${daysOfWeek[day]} kuni (${teacherConflict.start_time}-${teacherConflict.end_time}) "${confGroup.name}" guruhida darsi bor.`,
            400
          );
        }
      }
    }
  }

  async addSchedule(tenantId: string, groupId: string, data: any) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { branch_id: true, teacher_id: true, support_teacher_id: true }
    });

    if (!group) throw new HttpException('Guruh topilmadi', 404);

    // Conflict Check
    await this.validateSchedule(tenantId, group.branch_id, data.schedules, group.teacher_id, group.support_teacher_id, groupId);

    await this.prisma.schedule.deleteMany({ where: { group_id: groupId } });

    return this.prisma.group.update({
      where: { id: groupId, tenant_id: tenantId },
      data: {
        schedules: {
          createMany: {
            data: data.schedules.map((s: any) => ({
              day_of_week: Number(s.day_of_week),
              start_time: s.start_time,
              end_time: s.end_time,
              room_id: s.room_id || null
            }))
          }
        }
      }
    });
  }

  async getGroupAttendance(tenantId: string, groupId: string) {
    return this.prisma.group.findFirst({
      where: { id: groupId, tenant_id: tenantId },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            student: { include: { user: true } },
            attendances: {
              orderBy: { date: 'desc' },
              take: 30
            }
          }
        },
        schedules: true
      }
    });
  }

  // --- Rooms Management ---
  async getRooms(tenantId: string, branchId?: string) {
    const where: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') where.branch_id = branchId;
    return this.prisma.room.findMany({ where, orderBy: { name: 'asc' } });
  }

  async createRoom(tenantId: string, data: any) {
    return this.prisma.room.create({
      data: {
        tenant_id: tenantId,
        branch_id: data.branch_id,
        name: data.name,
        capacity: Number(data.capacity) || 0,
        description: data.description || '',
        is_active: data.is_active !== undefined ? data.is_active : true
      }
    });
  }

  async updateRoom(tenantId: string, id: string, data: any) {
    return this.prisma.room.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        name: data.name,
        capacity: Number(data.capacity) || 0,
        description: data.description || '',
        is_active: data.is_active !== undefined ? data.is_active : true
      }
    });
  }

  async deleteRoom(tenantId: string, id: string) {
    return this.prisma.room.deleteMany({
      where: { id, tenant_id: tenantId }
    });
  }

  // --- Enrollment Management ---
  async getAvailableStudents(tenantId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, tenant_id: tenantId },
      select: { branch_id: true }
    });

    if (!group) throw new HttpException('Guruh topilmadi', 404);

    const where: any = {
      tenant_id: tenantId,
      is_archived: false,
      enrollments: { none: { group_id: groupId, status: 'ACTIVE' } }
    };

    if (group.branch_id) {
      where.branch_id = group.branch_id;
    }

    return this.prisma.student.findMany({
      where,
      include: {
        user: { select: { first_name: true, last_name: true, phone: true } }
      },
      orderBy: { user: { first_name: 'asc' } }
    });
  }

  async enrollStudents(tenantId: string, groupId: string, studentIds: string[], activationDate?: string) {
    try {
      const group = await this.prisma.group.findUnique({
        where: { id: groupId },
        include: { schedules: true }
      });
      if (!group) throw new HttpException('Guruh topilmadi', 404);

      const monthStr = new Date().toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
      const formattedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

      return await this.prisma.$transaction(async (tx) => {
        for (const studentId of studentIds) {
          const student = await tx.student.findUnique({
            where: { id: studentId },
            include: { user: true }
          });

          if (!student) continue;

          const joinDate = activationDate ? new Date(activationDate) : new Date();
          
          // 1. Enrollment
          await tx.enrollment.create({
            data: { 
              group_id: groupId, 
              student_id: studentId, 
              status: 'ACTIVE',
              joined_at: joinDate
            }
          });

          // Skip Invoice if VIP
          if (student.is_vip || group.is_vip) {
            continue;
          }

          // --- Pro-rata Tuition Logic ---
          const startDate = group.last_stage_at || group.start_date;
          const durationMonths = group.stage_duration_months || 1;
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + durationMonths);
          
          const scheduleDays = group.schedules.map(s => s.day_of_week);
          const joinDateObj = activationDate ? new Date(activationDate) : new Date();
          
          // Jami darslar va qolgan darslar
          const totalPlanned = this.countSessions(startDate, endDate, scheduleDays);
          const remainingLessons = this.countSessions(joinDateObj > startDate ? joinDateObj : startDate, endDate, scheduleDays);

          const basePrice = Number(group.price) || 0;
          let proRatedPrice = basePrice;
          
          if (totalPlanned > 0 && remainingLessons < totalPlanned && joinDateObj > startDate) {
             proRatedPrice = (basePrice / totalPlanned) * remainingLessons;
          }

          const discountedAmount = await this.discountsService.applyDiscounts(tenantId, studentId, Math.round(proRatedPrice));

          // 2. Invoice
          await tx.invoice.create({
            data: {
              tenant_id: tenantId,
              branch_id: group.branch_id,
              student_id: studentId,
              group_id: groupId,
              amount: discountedAmount,
              status: 'UNPAID',
              type: 'COURSE',
              month: formattedMonth,
              start_date: startDate,
              end_date: endDate
            }
          });

          // 3. Balance deduction
          await tx.student.update({
            where: { id: studentId },
            data: { course_balance: { decrement: discountedAmount } }
          });

          // --- SMS Trigger ---
          if (student?.user?.phone) {
             this.smsService.handleTrigger(tenantId, group.branch_id, 'ENROLLMENT', {
               studentName: `${student.user.first_name} ${student.user.last_name}`,
               groupName: group.name,
               courseName: group.name,
               price: discountedAmount,
               date: new Date().toLocaleDateString()
             }, student.user.phone);
          }
        }
        return { success: true };
      }, { timeout: 300000 });
    } catch (e: any) {
      console.error("ENROLL STUDENTS ERROR", e);
      throw e;
    }
  }

  private countSessions(startDate: Date, endDate: Date, scheduleDays: number[]): number {
    if (scheduleDays.length === 0) return 0;
    let count = 0;
    let current = new Date(startDate);
    current.setHours(0,0,0,0);
    const end = new Date(endDate);
    end.setHours(23,59,59,999);

    while (current <= end) {
      if (scheduleDays.includes(current.getDay())) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  async markAttendance(tenantId: string, data: any) {
    const { groupId, date, scheduleId, attendances } = data;
    const group = await this.prisma.group.findFirst({ where: { id: groupId, tenant_id: tenantId } });
    if (!group) throw new HttpException('Guruh topilmadi', 404);

    return this.prisma.$transaction(
      attendances.map((att: any) => 
        this.prisma.attendance.upsert({
          where: {
            enrollment_id_schedule_id_date: {
              enrollment_id: att.enrollmentId,
              schedule_id: scheduleId,
              date: new Date(date)
            }
          },
          update: { 
            status: att.status,
            score: att.score 
          },
          create: {
            enrollment_id: att.enrollmentId,
            schedule_id: scheduleId,
            date: new Date(date),
            status: att.status,
            score: att.score
          }
        })
      )
    );
  }

  async calculateUnenrollmentAmount(tenantId: string, enrollmentId: string, leavingDate?: string) {
    try {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { 
          group: { include: { schedules: true } },
          student: { include: { user: true } }
        }
      });

      if (!enrollment || enrollment.group.tenant_id !== tenantId) {
         throw new HttpException('Ro\'yxatdan o\'tish ma\'lumoti topilmadi', 404);
      }

      const group = enrollment.group;
      const startDate = group.last_stage_at || group.start_date;
      const durationMonths = group.stage_duration_months || 1;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      let totalPlanned = 0;
      const scheduleDays = group.schedules.map(s => s.day_of_week);
      
      if (scheduleDays.length > 0) {
        let current = new Date(startDate);
        while (current < endDate) {
          if (scheduleDays.includes(current.getDay())) totalPlanned++;
          current.setDate(current.getDate() + 1);
        }
      }
      if (totalPlanned === 0) totalPlanned = 24; 

      const lDate = leavingDate ? new Date(leavingDate) : new Date();
      
      const attendedLessonsCount = await this.prisma.attendance.count({
        where: {
          enrollment_id: enrollmentId,
          date: { gte: startDate, lte: lDate },
          status: { in: ['PRESENT', 'LATE'] }
        }
      });

      // Faqat belgilangan sanagacha bo'lgan darslar soni (kelgan-kelmaganidan qat'iy nazar)
      const activePeriodLessons = this.countSessions(enrollment.joined_at || startDate, lDate > endDate ? endDate : lDate, scheduleDays);
      
      const price = Number(group.price) || 0;
      // O'quvchi guruhda bo'lgan vaqti uchun haqiqiy qarz (darslar soniga ko'ra)
      const amountToPay = totalPlanned > 0 ? (price / totalPlanned) * activePeriodLessons : 0;

      return {
        studentName: `${enrollment.student.user.first_name} ${enrollment.student.user.last_name}`,
        groupName: group.name,
        groupPrice: price,
        totalPlanned,
        activeLessons: activePeriodLessons,
        attendedLessons: attendedLessonsCount,
        amountToPay: Math.round(amountToPay)
      };
    } catch (e: any) {
      console.error("CALC UNENROLL AMOUNT ERROR", e);
      throw e;
    }
  }

  async unenrollStudent(tenantId: string, enrollmentId: string, leavingDate?: string) {
    try {
      const calc = await this.calculateUnenrollmentAmount(tenantId, enrollmentId, leavingDate);
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { student_id: true, group_id: true, group: { select: { branch_id: true } } }
      });
      if (!enrollment) throw new HttpException('Ro\'yxat topilmadi', 404);

      const lDate = leavingDate ? new Date(leavingDate) : new Date();

      return await this.prisma.$transaction(async (prisma) => {
        await prisma.enrollment.update({ 
          where: { id: enrollmentId }, 
          data: { 
            status: 'REMOVED',
            left_at: lDate
          } 
        });
        
        // Invoice ni yangilash yoki yangi to'lov yaratish
        const group = await prisma.enrollment.findUnique({ where: { id: enrollmentId } }).group();
        const startDate = group?.last_stage_at || group?.start_date || new Date();
        
        const currentInvoice = await prisma.invoice.findFirst({
          where: {
            student_id: enrollment.student_id,
            group_id: enrollment.group_id,
            type: 'COURSE',
            created_at: { gte: startDate }
          }
        });

        if (currentInvoice) {
           const diff = Number(currentInvoice.amount) - calc.amountToPay;
           await prisma.invoice.update({
             where: { id: currentInvoice.id },
             data: { amount: calc.amountToPay }
           });
           // Student balansini qaytaramiz (chunki invoice yaratilganda balans ayrilgan edi)
           await prisma.student.update({
             where: { id: enrollment.student_id },
             data: { 
               course_balance: { increment: diff },
               balance: { increment: diff }
             }
           });
        }

        if (calc.amountToPay > 0 && !currentInvoice) {
          const payment = await prisma.payment.create({
            data: {
              tenant_id: tenantId,
              student_id: enrollment.student_id,
              branch_id: enrollment.group.branch_id,
              amount: calc.amountToPay,
              type: 'CASH',
              created_at: new Date()
            }
          });
          await prisma.transaction.create({
            data: { payment_id: payment.id, amount: calc.amountToPay, balance_before: 0, balance_after: calc.amountToPay }
          });
        }
        return { success: true, amount: calc.amountToPay };
      });
    } catch (e: any) {
      console.error("UNENROLL STUDENT ERROR", e);
      throw e;
    }
  }

  async getGradingSettings(tenantId: string, branchId: string) {
    try {
      if (branchId === 'all') throw new HttpException('Filialni tanlang', 400);

      const branch = await this.prisma.branch.findFirst({
        where: { id: branchId, tenant_id: tenantId },
        select: { settings: true }
      });

      if (!branch) throw new HttpException('Filial topilmadi', 404);

      // FETCH REAL STATS
      const [totalExams, grades] = await Promise.all([
        this.prisma.exam.count({
          where: { group: { branch_id: branchId, tenant_id: tenantId } }
        }),
        this.prisma.grade.findMany({
          where: { exam: { group: { branch_id: branchId, tenant_id: tenantId } } },
          select: { score: true, exam: { select: { max_score: true } } }
        })
      ]);

      let avgScore = 0;
      if (grades.length > 0) {
        // Normalize to 10-point scale for the average display
        const totalNormalized = grades.reduce((acc, g) => acc + (g.score / g.exam.max_score * 10), 0);
        avgScore = totalNormalized / grades.length;
      }

      const settings = (branch.settings as any)?.grading_system || {
        method: '10-ball',
        thresholds: [
          { label: "A'lo", range: '9-10', type: 'success' },
          { label: 'Yaxshi', range: '7-8', type: 'primary' },
          { label: 'Qoniqarli', range: '5-6', type: 'warning' },
          { label: 'Qoniqarsiz', range: '0-4', type: 'danger' }
        ]
      };

      return {
        settings,
        stats: {
          totalExams,
          averageScore: Number(avgScore.toFixed(1))
        }
      };
    } catch (e: any) {
      console.error("GET GRADING SETTINGS ERROR", e);
      throw e;
    }
  }

  async updateGradingSettings(tenantId: string, branchId: string, data: any) {
    if (branchId === 'all') throw new HttpException('Filialni tanlang', 400);

    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, tenant_id: tenantId },
      select: { settings: true }
    });

    if (!branch) throw new HttpException('Filial topilmadi', 404);

    const settings = branch.settings as any || {};
    settings.grading_system = data;

    return this.prisma.branch.update({
      where: { id: branchId },
      data: { settings }
    });
  }

  async getArchiveStats(tenantId: string, branchId?: string) {
    const whereClause: any = {
      tenant_id: tenantId,
      is_archived: true,
    };

    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalArchive, recent] = await Promise.all([
      this.prisma.group.count({ where: whereClause }),
      this.prisma.group.count({
        where: {
          ...whereClause,
          archived_at: { gte: sevenDaysAgo }
        }
      })
    ]);

    return {
      totalArchive,
      recent,
      older: totalArchive - recent
    };
  }
}
