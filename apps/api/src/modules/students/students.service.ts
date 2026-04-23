// @ts-nocheck
import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { StudentStatus } from '../../../prisma/generated-client';
import { DiscountsService } from '../discounts/discounts.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private discountsService: DiscountsService
  ) {}

  async getStudentDashboard(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        user: true,
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            group: {
              include: {
                course: true,
                teacher: { include: { user: true } },
                room: true,
                schedules: true
              }
            }
          }
        },
        grades: { include: { exam: true } },
        submissions: true
      }
    });

    if (!student) throw new NotFoundException('Talaba profili topilmadi');

    // 1. Hisob-kitoblar (Stats)
    const diffTime = Math.abs(new Date().getTime() - student.joined_at.getTime());
    const studyDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const studyMonths = Math.ceil(studyDays / 30.44);
    
    let totalMastery = 0;
    if (student.grades.length > 0) {
      const masteryList = student.grades.map(g => (g.score / (g.exam?.max_score || 100)) * 100);
      totalMastery = Math.round(masteryList.reduce((a, b) => a + b, 0) / masteryList.length);
    }

    // Optimized Rank Calculation
    const studentMastery = totalMastery;
    
    // Count students with higher average mastery using a more efficient approach
    // We fetch only students who have grades and their average scores
    const leaderboard = await this.prisma.grade.groupBy({
      by: ['student_id'],
      where: {
        student: { tenant_id: student.tenant_id, is_archived: false }
      },
      _avg: {
        score: true
      }
    });

    // Note: This is still a bit simplified because max_score varies per exam.
    // For a truly accurate rank, we'd need raw SQL or to fetch mastery pre-calculated.
    // But this is already MUCH faster than fetching all student objects.
    const studentRank = leaderboard.filter(s => (s._avg.score || 0) > studentMastery).length + 1;

    // Topshirilmagan vazifalar sonini aniqlash
    const groupIds = student.enrollments.map(e => e.group_id);
    const totalAssignments = await this.prisma.assignment.count({
      where: { group_id: { in: groupIds } }
    });
    const pendingTasks = Math.max(0, totalAssignments - student.submissions.length);

    // 2. Bugungi dars jadvali
    const today = new Date().getDay(); // 0-6
    const schedule = [];

    student.enrollments.forEach(enr => {
      const todaySchedule = enr.group.schedules.find(s => s.day_of_week === today);
      if (todaySchedule) {
        schedule.push({
          id: enr.group.id,
          time: todaySchedule.start_time,
          duration: '1.5 soat', // Standart yoki hisoblangan
          course_name: enr.group.course.name,
          room: enr.group.room?.name || 'Xona tayinlanmagan',
          teacher: enr.group.teacher ? `${enr.group.teacher.user.first_name} ${enr.group.teacher.user.last_name}` : 'O\'qituvchi tayinlanmagan',
          status: 'Yaqinlashmoqda'
        });
      }
    });

    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    return {
      profile: {
        first_name: student.user.first_name,
        last_name: student.user.last_name,
        photo_url: student.user.photo_url,
        phone: student.user.phone
      },
      balance: Number(student.balance),
      stats: {
        studyDays: studyDays || 0,
        studyMonths: studyMonths || 0,
        mastery: totalMastery || 0,
        rank: studentRank || 0,
        pendingTasks: pendingTasks || 0
      },
      schedule: schedule.sort((a, b) => a.time.localeCompare(b.time)),
      courses: student.enrollments.map(enr => {
        const schedules = enr.group?.schedules || [];
        const daysNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
        
        const now = new Date();
        const currentDay = now.getDay(); // 0-6
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        // Robust sorting: handle both 0-6 and 1-7 (Sunday=7)
        const sortedSchedules = [...schedules].sort((a, b) => {
          const dayA = a.day_of_week === 7 ? 0 : a.day_of_week;
          const dayB = b.day_of_week === 7 ? 0 : b.day_of_week;
          if (dayA !== dayB) return dayA - dayB;
          return a.start_time.localeCompare(b.start_time);
        });

        let nextSchedule = sortedSchedules.find(s => {
          const day = s.day_of_week === 7 ? 0 : s.day_of_week;
          return day > currentDay || (day === currentDay && s.start_time > currentTime);
        });

        if (!nextSchedule && sortedSchedules.length > 0) {
          nextSchedule = sortedSchedules[0]; 
        }

        const nextLessonStr = nextSchedule 
          ? `${nextSchedule.start_time} (${daysNames[nextSchedule.day_of_week === 7 ? 0 : nextSchedule.day_of_week] || 'Noma\'lum'})` 
          : 'Noma\'lum';

        return {
          id: enr.id,
          group_id: enr.group_id,
          course_name: enr.group.course.name,
          teacher: enr.group.teacher ? `${enr.group.teacher.user.first_name} ${enr.group.teacher.user.last_name}` : 'O\'qituvchi tayinlanmagan',
          progress: 0, 
          next_lesson: nextLessonStr,
          schedules: enr.group.schedules.map(s => ({
            id: s.id,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            room: enr.group.room?.name || 'Xona tayinlanmagan'
          }))
        };
      })
    };
  }

  async getStudentAttendance(userId: string, year: number, month: number, groupId?: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: { 
        enrollments: { 
          include: { group: { include: { course: true } } } 
        } 
      }
    });

    if (!student) throw new NotFoundException('Talaba topilmadi');

    const enrollments = student.enrollments;
    const groupsCount = enrollments.map(e => ({
      id: e.group.id,
      name: e.group.name,
      course_name: e.group.course.name
    }));

    // Guruhlarni id bo'yicha unikal qilish (React key error olmaslik uchun)
    const groups = Array.from(new Map(groupsCount.map(g => [g.id, g])).values());

    // Agar groupId berilmagan bo'lsa barcha faol enrollment'larni id'larini olamiz
    const targetEnrollmentIds = enrollments
      .filter(e => !groupId || e.group_id === groupId)
      .map(e => e.id);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        enrollment_id: { in: targetEnrollmentIds },
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Statistika hisoblash
    const statusCounts = {
      PRESENT: attendances.filter(a => a.status === 'PRESENT').length,
      ABSENT: attendances.filter(a => a.status === 'ABSENT').length,
      LATE: attendances.filter(a => a.status === 'LATE').length,
    };

    const totalMarked = attendances.length;
    const presenceRate = totalMarked > 0 ? Math.round((statusCounts.PRESENT / totalMarked) * 100) : 0;

    return {
      groups,
      attendances: attendances.map(a => ({
        day: a.date.getDate(),
        status: a.status, // PRESENT, ABSENT, LATE
        score: a.score
      })),
      stats: {
        presenceRate,
        absentCount: statusCounts.ABSENT,
        lateCount: statusCounts.LATE
      }
    };
  }

  async getStudentLeaderboard(userId: string, type: 'group' | 'center') {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: { enrollments: { select: { group_id: true } } }
    });

    if (!student) throw new NotFoundException('Talaba topilmadi');

    const groupIds = student.enrollments.map(e => e.group_id);

    const whereClause: any = {
      tenant_id: student.tenant_id,
      is_archived: false
    };

    if (type === 'group' && groupIds.length > 0) {
      whereClause.enrollments = { some: { group_id: { in: groupIds } } };
    }

    const students = await this.prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        user_id: true,
        user: { select: { first_name: true, last_name: true, photo_url: true } },
        grades: { select: { score: true } },
        enrollments: { 
          select: { 
            attendances: { 
              where: { score: { not: null } },
              select: { score: true } 
            } 
          } 
        }
      }
    });

    const leaderboard = students.map(s => {
      const gradeScore = s.grades.reduce((sum, g) => sum + (g.score || 0), 0);
      const attendanceScore = s.enrollments.reduce((sum, e) => 
        sum + e.attendances.reduce((aSum, a) => aSum + (a.score || 0), 0)
      , 0);

      return {
        id: s.id,
        name: `${s.user.first_name} ${s.user.last_name}`,
        points: gradeScore + attendanceScore,
        avatar: s.user.first_name?.charAt(0) || 'S',
        isMe: s.user_id === userId
      };
    }).sort((a, b) => b.points - a.points);

    return leaderboard.slice(0, 50); // Top 50 talaba
  }

  async getStudentCertificates(userId: string) {
    // Kelajakda Certificate model bo'lsa shundan olinadi. 
    // Hozircha erishilgan yutuqlar asosida (mock-like but real data driven descriptors)
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: { grades: true, enrollments: { include: { attendances: true } } }
    });

    const achievements = [];
    
    // Average score based achievement
    const avgScore = student.grades.length > 0 
      ? student.grades.reduce((sum, g) => sum + g.score, 0) / student.grades.length 
      : 0;
    
    if (avgScore >= 90) {
      achievements.push({ id: 'top-student', title: 'Top Student', desc: "A'lo natijalar uchun", icon: 'ribbon', color: '#F59E0B' });
    }

    // Attendance achievement
    const totalAttendances = student.enrollments.reduce((sum, e) => sum + e.attendances.length, 0);
    const presentCount = student.enrollments.reduce((sum, e) => 
      sum + e.attendances.filter(a => a.status === 'PRESENT').length
    , 0);
    
    if (totalAttendances > 10 && (presentCount / totalAttendances) >= 0.95) {
      achievements.push({ id: 'perfect-attendance', title: '100% Davomat', desc: 'Dars qoldirmagani uchun', icon: 'shield-checkmark', color: '#10B981' });
    }

    return {
      certificates: [], // Kelajakda real PDF sertifikatlar bo'lsa shu joyga qo'shiladi
      achievements
    };
  }

  async getStudentGrades(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        grades: {
          include: { 
            exam: { include: { group: { include: { course: true } } } } 
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!student) throw new NotFoundException('Talaba topilmadi');

    return student.grades.map(g => ({
      id: g.id,
      course_name: g.exam?.group?.course?.name || 'Kurs',
      exam_name: g.exam?.title || 'Imtihon',
      score: g.score,
      max_score: g.exam?.max_score || 100,
      date: g.created_at,
      feedback: g.feedback
    }));
  }

  async getStudentAssignments(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: { enrollments: { select: { group_id: true } } }
    });

    if (!student) throw new NotFoundException('Talaba topilmadi');

    const groupIds = student.enrollments.map(e => e.group_id);
    const assignments = await this.prisma.assignment.findMany({
      where: { group_id: { in: groupIds } },
      include: {
        group: { include: { course: true, teacher: { include: { user: true } } } },
        submissions: { where: { student_id: student.id } }
      },
      orderBy: { deadline: 'desc' }
    });

    return assignments.map(a => {
      const submission = a.submissions[0];
      let status = 'PENDING';
      if (submission) status = 'SUBMITTED';
      else if (new Date(a.deadline) < new Date()) status = 'MISSED';

      return {
        id: a.id,
        title: a.title,
        course_name: a.group.course?.name || 'Kurs',
        teacher: a.group.teacher ? `${a.group.teacher.user.first_name} ${a.group.teacher.user.last_name}` : 'Ustoz',
        deadline: a.deadline,
        status,
        score: submission?.score ?? null,
        max_score: a.max_score
      };
    });
  }

  async getStudentInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: {
        student: { user_id: userId },
        status: 'UNPAID'
      },
      include: { group: { select: { name: true, course: { select: { name: true } } } } },
      orderBy: { created_at: 'desc' }
    });
  }

  async getStudentPayments(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        student: { user_id: userId },
        is_archived: false
      },
      include: {
        invoice: true,
        cashier: { select: { first_name: true, last_name: true } },
        group: { include: { course: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    return payments.map(p => {
      let typeLabel = 'monthly_fee';
      if (p.invoice?.type === 'BOOK') typeLabel = 'book_fee';
      if (p.invoice?.type === 'EXAM') typeLabel = 'exam_fee';

      return {
        id: p.id,
        amount: Number(p.amount),
        type: typeLabel,
        method: p.type === 'CASH' ? 'cash' : 'card',
        accepted_by: p.cashier ? `${p.cashier.first_name} ${p.cashier.last_name}` : 'Admin',
        created_at: p.created_at.toISOString().split('T')[0],
        description: p.description
      };
    });
  }

  async getStudentProfile(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        user: { select: { first_name: true, last_name: true, phone: true, photo_url: true, gender: true } },
        branch: { select: { name: true } },
        grades: true,
        enrollments: { include: { attendances: true } }
      }
    });

    if (!student) throw new NotFoundException('Talaba topilmadi');

    const totalAttendances = student.enrollments.reduce((sum, e) => sum + e.attendances.length, 0);
    const presentCount = student.enrollments.reduce((sum, e) => 
      sum + e.attendances.filter(a => a.status === 'PRESENT').length
    , 0);
    
    const avgScore = student.grades.length > 0 
      ? student.grades.reduce((sum, g) => sum + g.score, 0) / student.grades.length 
      : 0;

    return {
      profile: student.user,
      branch_name: student.branch?.name,
      status: student.status,
      joined_at: student.joined_at,
      stats: {
        avgScore: parseFloat(avgScore.toFixed(1)),
        attendanceRate: totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0,
        balance: Number(student.balance)
      }
    };
  }

  async getStudents(tenantId: string, branchId?: string, query?: any) {
    const whereClause: any = { tenant_id: tenantId };
    
    // Default to active students
    if (query?.is_archived === 'true') {
      whereClause.is_archived = true;
    } else {
      whereClause.is_archived = false;
    }

    if (query?.start_date && query?.end_date) {
      if (query.is_archived === 'true') {
        whereClause.archived_at = {
          gte: new Date(query.start_date),
          lte: new Date(query.end_date + 'T23:59:59.999Z')
        };
      } else {
         whereClause.joined_at = {
          gte: new Date(query.start_date),
          lte: new Date(query.end_date + 'T23:59:59.999Z')
        };
      }
    }

    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
    }

    if (query?.search) {
      whereClause.user = {
        ...whereClause.user,
        OR: [
          { first_name: { contains: query.search, mode: 'insensitive' } },
          { last_name: { contains: query.search, mode: 'insensitive' } },
        ]
      };
    }

    if (query?.phone) {
      whereClause.user = {
        ...whereClause.user,
        phone: { contains: query.phone, mode: 'insensitive' }
      };
    }

    if (query?.parent_phone) {
      whereClause.parent_phone = { contains: query.parent_phone, mode: 'insensitive' };
    }

    if (query?.tags) {
      whereClause.tags = { has: query.tags };
    }

    if (query?.group_id || query?.course_id || query?.teacher_id) {
      whereClause.enrollments = { some: { status: 'ACTIVE', group: {} } };
      
      if (query?.group_id) {
        whereClause.enrollments.some.group_id = query.group_id;
      }
      
      if (query?.course_id) {
        whereClause.enrollments.some.group.course_id = query.course_id;
      }
      
      if (query?.teacher_id) {
        whereClause.enrollments.some.group.OR = [
          { teacher_id: query.teacher_id },
          { support_teacher_id: query.teacher_id }
        ];
      }
    }

    if (query?.status && query.status !== 'all') {
      whereClause.status = query.status as StudentStatus;
    }

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.student.count({ where: whereClause }),
      this.prisma.student.findMany({
        where: whereClause,
        select: {
          id: true,
          phone: true,
          first_name: false, // first_name is on User
          last_name: false,
          status: true,
          joined_at: true,
          balance: true,
          branch: { select: { name: true } },
          user: { select: { id: true, phone: true, first_name: true, last_name: true, photo_url: true } },
          enrollments: {
            where: { status: 'ACTIVE' },
            select: {
              group: {
                select: {
                  id: true,
                  name: true,
                  course: { select: { name: true } }
                }
              }
            }
          }
        },
        orderBy: { joined_at: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createStudent(tenantId: string, data: any) {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingUser) throw new HttpException('Bu telefon raqami bilan foydalanuvchi mavjud', 400);

      let studentRole = await this.prisma.role.findUnique({ where: { slug: 'student' } });
      if (!studentRole) {
        studentRole = await this.prisma.role.create({
          data: { name: 'Talaba', slug: 'student', permissions: ['PROFILE'] }
        });
      }

      const hashedPassword = await bcrypt.hash(data.password || '123456', 10);

      return await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            tenant_id: tenantId,
            phone: data.phone,
            first_name: data.firstName,
            last_name: data.lastName,
            gender: data.gender || null,
            password_hash: hashedPassword,
            role_id: studentRole!.id,
          }
        });

        const student = await prisma.student.create({
          data: {
            tenant_id: tenantId,
            branch_id: data.branchId === 'all' ? null : (data.branchId || null),
            user_id: user.id,
            status: StudentStatus.ACTIVE,
            date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          }
        });

        await prisma.notification.create({
          data: {
            tenant_id: tenantId,
            type: 'INFO',
            channel: 'SYSTEM',
            recipient_id: 'admin',
            status: `Yangi talaba qo'shildi: ${data.firstName} ${data.lastName}`,
          }
        });

        return student;
      });
    } catch (err: any) {
      console.error(err);
      throw new HttpException(err.message || 'Talaba yaratishda xatolik', err.status || 500);
    }
  }

  async bulkCreateStudents(tenantId: string, data: { branchId?: string, students: any[] }) {
    const { branchId: defaultBranchId, students: studentsData } = data;
    
    try {
      let studentRole = await this.prisma.role.findUnique({ where: { slug: 'student' } });
      if (!studentRole) {
        studentRole = await this.prisma.role.create({
          data: { name: 'Talaba', slug: 'student', permissions: ['PROFILE'] }
        });
      }

      const results = {
        success: 0,
        errors: [] as string[]
      };

      // 1. Extract and normalize all phones
      const phones = studentsData
        .map(d => String(d['Telefon'] || d['phone'] || '').replace(/\s/g, ''))
        .filter(p => !!p);

      // 2. Pre-fetch existing users to avoid individual queries inside loop
      const existingUsers = await this.prisma.user.findMany({
        where: { phone: { in: phones } },
        select: { phone: true }
      });
      const existingPhones = new Set(existingUsers.map(u => u.phone));

      // 3. Pre-process data (hashing passwords is slow, do it outside transaction)
      const processedStudents = await Promise.all(studentsData.map(async (data) => {
        const phone = String(data['Telefon'] || data['phone'] || '').replace(/\s/g, '');
        if (!phone) return { error: `Qatorda telefon raqami yo'q` };
        if (existingPhones.has(phone)) return { error: `${phone} raqamli foydalanuvchi allaqachon mavjud` };

        const password = data['Parol'] || data['password'] || '123456';
        const hashedPassword = await bcrypt.hash(String(password), 10);

        return {
          phone,
          firstName: data['Ism'] || data['firstName'] || 'Ismsiz',
          lastName: data['Familiya'] || data['lastName'] || '',
          gender: data['Jinsi'] === 'Ayol' ? 'FEMALE' : (data['Jinsi'] === 'Erkak' ? 'MALE' : null),
          hashedPassword,
          dateOfBirth: data['Tug\'ilgan sana'] ? new Date(data['Tug\'ilgan sana']) : null,
          branchId: data.branchId || (defaultBranchId !== 'all' ? defaultBranchId : null)
        };
      }));

      // 4. Parallel Create Users and Profiles
      const processedResults = await Promise.all(processedStudents.map(async (student) => {
        if ('error' in student) {
          return { success: false, error: student.error };
        }

        try {
          return await this.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.create({
              data: {
                tenant_id: tenantId,
                phone: student.phone,
                first_name: student.firstName,
                last_name: student.lastName,
                gender: student.gender as any,
                password_hash: student.hashedPassword,
                role_id: studentRole!.id,
              }
            });

            await prisma.student.create({
              data: {
                tenant_id: tenantId,
                branch_id: student.branchId,
                user_id: user.id,
                status: StudentStatus.ACTIVE,
                date_of_birth: student.dateOfBirth,
              }
            });

            return { success: true };
          });
        } catch (e: any) {
          return { success: false, error: `Xatolik (${student.phone}): ${e.message}` };
        }
      }));

      for (const res of processedResults) {
        if (res.success) {
          results.success++;
        } else {
          results.errors.push(res.error as string);
        }
      }

      if (results.success === 0 && results.errors.length > 0) {
        throw new Error('Hech qanday talaba qo\'shilmadi: ' + results.errors[0]);
      }

      return results;
    } catch (err: any) {
      console.error(err);
      throw new HttpException(err.message || 'Ommaviy yaratishda xatolik', 500);
    }
  }

  async getStudentById(tenantId: string, id: string, branchId?: string) {
    const whereClause: any = { id, tenant_id: tenantId };
    if (branchId && branchId !== 'all') whereClause.branch_id = branchId;
    
    const student = await this.prisma.student.findUnique({
      where: whereClause,
      include: { 
        user: true, 
        branch: true,
        enrollments: { where: { status: 'ACTIVE' }, include: { group: { include: { course: true, teacher: { include: { user: true } } } }, attendances: true } }, 
        payments: { include: { transaction: true } },
        grades: { include: { exam: true } },
        discounts: { include: { discount: true } },
        teacherFeedbacks: { include: { teacher: { include: { user: true } } }, orderBy: { created_at: 'desc' } },
        saleTransactions: { include: { items: { include: { product: { include: { category: true } } } } }, orderBy: { created_at: 'desc' } }
      },
    });
    if (!student) throw new NotFoundException('Talaba topilmadi');

    const enrolledGroupIds = student.enrollments.map(e => e.group_id);

    // Optimized: Fetch all relevant data for rankings in one/two goes
    const [allExams, enrollmentCounts] = await Promise.all([
      this.prisma.exam.findMany({
        where: { group_id: { in: enrolledGroupIds } },
        include: { grades: { include: { student: { include: { user: true } } } } }
      }),
      this.prisma.enrollment.groupBy({
        by: ['group_id'],
        where: { group_id: { in: enrolledGroupIds }, status: 'ACTIVE' },
        _count: { _all: true }
      })
    ]);

    // Guruh reytinglarini hisoblash
    const groupRankings = student.enrollments.map((enr) => {
        const exams = allExams.filter(exam => exam.group_id === enr.group_id);
        const totalStudentsCount = enrollmentCounts.find(ec => ec.group_id === enr.group_id)?._count?._all || 0;

        const studentScores: Record<string, { student: any, total_score: number, exams_count: number }> = {};
        
        exams.forEach(exam => {
            exam.grades.forEach(grade => {
                if (!studentScores[grade.student_id]) {
                    studentScores[grade.student_id] = { student: grade.student, total_score: 0, exams_count: 0 };
                }
                const scorePct = (grade.score / (exam.max_score || 100)) * 100;
                studentScores[grade.student_id].total_score += scorePct;
                studentScores[grade.student_id].exams_count += 1;
            });
        });

        const rankingList = Object.values(studentScores).map(s => ({
            student_id: s.student.id,
            name: `${s.student.user.first_name} ${s.student.user.last_name}`,
            score: s.exams_count > 0 ? Math.round(s.total_score / s.exams_count) : 0,
            photo_url: s.student.user.photo_url
        })).sort((a, b) => b.score - a.score);

        const rankIndex = rankingList.findIndex(s => s.student_id === student.id);
        let currentStudentScore = 0;
        
        if (rankIndex === -1) {
            rankingList.push({
                student_id: student.id,
                name: `${student.user.first_name} ${student.user.last_name}`,
                score: 0,
                photo_url: student.user.photo_url
            });
        } else {
            currentStudentScore = rankingList[rankIndex].score;
        }

        // Qayta sortlash kafolati
        rankingList.sort((a, b) => b.score - a.score);
        const finalRankIndex = rankingList.findIndex(s => s.student_id === student.id);
        const rank = finalRankIndex + 1;

        return {
            group_id: enr.group_id,
            group_name: enr.group.name,
            course_name: enr.group.course?.name || 'Noma\'lum Kurs',
            teacher_name: (enr.group as any).teacher ? `${(enr.group as any).teacher.user?.first_name} ${(enr.group as any).teacher.user?.last_name}` : 'O\'qituvchi tayinlanmagan',
            rank,
            score: currentStudentScore,
            total_students: Math.max(totalStudentsCount, rankingList.length),
            ranking_list: rankingList.slice(0, 5),
        };
    });

    // Uyga vazifalarni formirovat qilish (talaba uzining aktiv guruhlaridagi hamma assignmentlar)
    const assignments = await this.prisma.assignment.findMany({
        where: { group_id: { in: enrolledGroupIds } },
        include: { 
            group: { include: { course: true, teacher: { include: { user: true } } } },
            submissions: { where: { student_id: student.id } }
        },
        orderBy: { deadline: 'desc' }
    });

    const homeworks = assignments.map(a => {
        const submission = a.submissions[0];
        let status = 'Kutilmoqda'; // Pending
        if (submission) status = 'Topshirilgan';
        else if (new Date(a.deadline) < new Date()) status = 'Kechikkan'; // Missed

        return {
            id: a.id,
            title: a.title,
            course_name: a.group.course?.name || 'Kurs',
            group_name: a.group.name,
            teacher_name: (a.group as any).teacher ? `${(a.group as any).teacher.user?.first_name} ${(a.group as any).teacher.user?.last_name}` : '',
            deadline: a.deadline,
            max_score: a.max_score,
            status,
            score: submission?.score ?? null,
            submitted_at: submission?.submitted_at ?? null,
            feedback: submission?.feedback ?? null
        };
    });

    return { ...student, groupRankings, homeworks };
  }

  async assignToGroup(tenantId: string, studentId: string, groupId: string, joined_at?: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { schedules: true }
    });
    if (!group) throw new NotFoundException('Guruh topilmadi');

    const student = await this.prisma.student.findUnique({
      where: { id: studentId }
    });
    if (!student) throw new NotFoundException('Talaba topilmadi');

    return this.prisma.$transaction(async (tx) => {
      const joinDate = joined_at ? new Date(joined_at) : new Date();
      const enrollment = await tx.enrollment.create({
        data: { student_id: studentId, group_id: groupId, status: 'ACTIVE', joined_at: joinDate, enrolled_at: new Date() },
      });

      // Skip Invoice if VIP
      if (student.is_vip || group.is_vip) {
        return enrollment;
      }

      // --- Pro-rata Tuition Logic ---
      const startDate = group.last_stage_at || group.start_date;
      const durationMonths = group.stage_duration_months || 1;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);
      
      const scheduleDays = group.schedules.map(s => s.day_of_week);
      
      let totalPlanned = this.countSessions(startDate, endDate, scheduleDays);
      let remainingLessons = this.countSessions(joinDate > startDate ? joinDate : startDate, endDate, scheduleDays);

      if (totalPlanned === 0) {
        // Fallback to purely day-based calculation if no schedules exist
        totalPlanned = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        remainingLessons = Math.max(0, Math.ceil((endDate.getTime() - (joinDate > startDate ? joinDate.getTime() : startDate.getTime())) / (1000 * 60 * 60 * 24)));
      }

      const basePrice = Number(group.price) || 0;
      let proRatedPrice = basePrice;

      // Kunlik yoki darslik pro-rata hisobi:
      // Foydalanuvchi talabiga ko'ra (10 kun kechikkaniga mos ravishda): kunlik asosida hisoblash ham mumkin.
      // Lekin hozirgi darslik mantiq (lessons) aniqroq. Agar foydalanuvchi kunlik qat'iy xohlasa:
      // const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      // const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
      // proRatedPrice = (basePrice / totalDays) * remainingDays;

      if (totalPlanned > 0 && remainingLessons < totalPlanned && joinDate > startDate) {
        proRatedPrice = (basePrice / totalPlanned) * remainingLessons;
      }

      const discountedAmount = await this.discountsService.applyDiscounts(tenantId, studentId, Math.round(proRatedPrice));

      // Avtomatik Kvitansiya (Qarz) yozish
      const monthStr = new Date().toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });
      await tx.invoice.create({
        data: {
          tenant_id: tenantId,
          branch_id: group.branch_id,
          student_id: studentId,
          group_id: groupId,
          amount: discountedAmount,
          status: 'UNPAID',
          type: 'COURSE',
          month: monthStr.charAt(0).toUpperCase() + monthStr.slice(1)
        }
      });

      // Talabani umumiy hisobidan ushlab qolamiz
      await tx.student.update({
        where: { id: studentId },
        data: { course_balance: { decrement: discountedAmount } }
      });

      return enrollment;
    });
  }

  async removeFromGroup(tenantId: string, data: { enrollmentId: string; left_at?: string; reason?: string }) {
    const { enrollmentId, left_at, reason } = data;

    return await this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { group: { include: { schedules: true } } }
      });

      if (!enrollment) throw new NotFoundException('Enrollment topilmadi');

      const leaveDate = left_at ? new Date(left_at) : new Date();

      const updatedEnrollment = await tx.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'LEFT',
          left_at: leaveDate
        }
      });

      // Joriy oydagi invoiceni qidiramiz
      const invoice = await tx.invoice.findFirst({
        where: { student_id: enrollment.student_id, group_id: enrollment.group_id, tenant_id: tenantId },
        orderBy: { created_at: 'desc' }
      });

      if (invoice && enrollment.group && !enrollment.group.is_vip) {
        const group = enrollment.group;
        const startDate = group.last_stage_at || group.start_date;
        const durationMonths = group.stage_duration_months || 1;
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + durationMonths);

        // Agar chiqib ketish sanasi kursning tugashidan oldin bo'lsa
        if (leaveDate < endDate) {
          const scheduleDays = group.schedules.map(s => s.day_of_week);
          const joinDate = enrollment.joined_at || startDate;
          
          let expectedLessons = this.countSessions(joinDate > startDate ? joinDate : startDate, endDate, scheduleDays);
          let actualLessons = this.countSessions(joinDate > startDate ? joinDate : startDate, leaveDate, scheduleDays);

          if (expectedLessons === 0) {
            // Fallback to days
            expectedLessons = Math.max(1, Math.ceil((endDate.getTime() - (joinDate > startDate ? joinDate.getTime() : startDate.getTime())) / (1000 * 60 * 60 * 24)));
            actualLessons = Math.max(0, Math.ceil((leaveDate.getTime() - (joinDate > startDate ? joinDate.getTime() : startDate.getTime())) / (1000 * 60 * 60 * 24)));
          }

          if (expectedLessons > 0 && actualLessons < expectedLessons) {
            const currentAmount = Number(invoice.amount);
            const proRatedPrice = (currentAmount / expectedLessons) * actualLessons;
            const difference = currentAmount - proRatedPrice;

            // Invoiceni yangilash (qarzni kamaytirish)
            await tx.invoice.update({
              where: { id: invoice.id },
              data: { amount: Math.round(proRatedPrice), end_date: leaveDate }
            });

            // Talabaning balansiga qaytarish (qarzdan yechish)
            await tx.student.update({
              where: { id: enrollment.student_id },
              data: { course_balance: { increment: difference } } // qarzi kamaygani uchun balansga qaytariladi
            });
          }
        }
      }

      return updatedEnrollment;
    });
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

  async updateStudent(tenantId: string, id: string, data: any) {
    const student = await this.prisma.student.findUnique({
      where: { id, tenant_id: tenantId },
      include: { user: true }
    });
    if (!student) throw new NotFoundException('Talaba topilmadi');

    return await this.prisma.$transaction(async (prisma) => {
      if (data.phone && data.phone !== student.user.phone) {
        const existingUser = await prisma.user.findFirst({
          where: { phone: data.phone, NOT: { id: student.user_id } }
        });
        if (existingUser) throw new HttpException('Bu telefon raqami band', 400);
      }

      await prisma.user.update({
        where: { id: student.user_id },
        data: {
          first_name: data.firstName || undefined,
          last_name: data.lastName || undefined,
          phone: data.phone || undefined,
        }
      });

      const updatedStudent = await prisma.student.update({
        where: { id },
        data: {
          status: (data.status as StudentStatus) || undefined,
          branch_id: data.branchId === 'all' ? null : (data.branchId || undefined),
          date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          parent_phone: data.parentPhone || undefined,
        }
      });

      return updatedStudent;
    });
  }

  async updatePassword(tenantId: string, id: string, data: any) {
    const student = await this.prisma.student.findUnique({
      where: { id, tenant_id: tenantId },
    });
    if (!student) throw new NotFoundException('Talaba topilmadi');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.update({
      where: { id: student.user_id },
      data: { password_hash: hashedPassword }
    });
  }

  async transferGroup(tenantId: string, studentId: string, fromGroupId: string, toGroupId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Deactivate old enrollment
      await tx.enrollment.updateMany({
        where: { student_id: studentId, group_id: fromGroupId, status: 'ACTIVE' },
        data: { status: 'TRANSFERRED' }
      });

      // 2. Create new enrollment
      return tx.enrollment.create({
        data: {
          student_id: studentId,
          group_id: toGroupId,
          status: 'ACTIVE'
        }
      });
    });
  }

  async deleteStudent(tenantId: string, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, tenant_id: tenantId },
    });
    if (!student) throw new NotFoundException('Talaba topilmadi');

    return await this.prisma.$transaction(async (prisma) => {
      const student_user_id = student.user_id;

      // 1. Delete dependent records in order to avoid FK constraint errors
      // Some are Cascade in schema, but we'll be explicit for those that aren't
      
      // Attendance & Submissions are usually cascade via Enrollment/Assignment, 
      // but let's handle the main blockers
      
      await prisma.payment.deleteMany({ where: { student_id: id } });
      await prisma.invoice.deleteMany({ where: { student_id: id } });
      await prisma.enrollment.deleteMany({ where: { student_id: id } });
      await prisma.grade.deleteMany({ where: { student_id: id } });
      await prisma.submission.deleteMany({ where: { student_id: id } });
      await prisma.teacherFeedback.deleteMany({ where: { student_id: id } });
      await prisma.callCenterTask.deleteMany({ where: { student_id: id } });
      await prisma.studentDiscount.deleteMany({ where: { student_id: id } });
      await prisma.saleTransaction.deleteMany({ where: { student_id: id } });

      // 2. Delete the student and user
      await prisma.student.delete({ where: { id } });
      await prisma.user.delete({ where: { id: student_user_id } });

      return { success: true };
    }, {
      timeout: 15000 // Give more time for recursive deletion
    });
  }

  async getArchiveReasons(tenantId: string) {
    return this.prisma.studentArchiveReason.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'asc' }
    });
  }

  async createArchiveReason(tenantId: string, name: string) {
    return this.prisma.studentArchiveReason.create({
      data: { tenant_id: tenantId, name }
    });
  }

  async archiveStudent(tenantId: string, id: string, reason: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, tenant_id: tenantId }
    });
    if (!student) throw new NotFoundException('Talaba topilmadi');

    return await this.prisma.$transaction(async (prisma) => {
      // Archive student
      const updated = await prisma.student.update({
        where: { id },
        data: {
          is_archived: true,
          archive_reason: reason,
          archived_at: new Date(),
          status: 'REMOVED'
        }
      });

      // Remove from active enrollments
      await prisma.enrollment.updateMany({
        where: { student_id: id, status: 'ACTIVE' },
        data: { status: 'REMOVED' }
      });

      return updated;
    });
  }

  async restoreStudent(tenantId: string, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, tenant_id: tenantId }
    });
    if (!student) throw new NotFoundException('Talaba topilmadi');

    return this.prisma.student.update({
      where: { id },
      data: {
        is_archived: false,
        archive_reason: null,
        archived_at: null,
        status: 'ACTIVE'
      }
    });
  }

  async getArchiveStats(tenantId: string, branchId?: string) {
    const whereClause: any = {
      tenant_id: tenantId,
      is_archived: true,
    };

    const allWhereClause: any = {
      tenant_id: tenantId,
    };

    if (branchId && branchId !== 'all') {
      whereClause.branch_id = branchId;
      allWhereClause.branch_id = branchId;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalArchive, totalAll, recent] = await Promise.all([
      this.prisma.student.count({ where: whereClause }),
      this.prisma.student.count({ where: allWhereClause }),
      this.prisma.student.count({
        where: {
          ...whereClause,
          archived_at: { gte: sevenDaysAgo }
        }
      })
    ]);

    return {
      totalArchive,
      totalAll,
      recent,
      older: totalArchive - recent
    };
  }
}
