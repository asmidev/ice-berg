import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string, branchId?: string, startDate?: string, endDate?: string) {
    if (!tenantId) throw new Error('Tenant ID is required');
    
    // Ensure the tenant exists
    const tenantExists = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenantExists) throw new Error('Tenant not found');

    const defaultWhere: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') {
      defaultWhere.branch_id = branchId;
    }

    // 📅 Date Logic
    const startOfPeriod = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const endOfPeriod = endDate ? new Date(endDate) : new Date();
    
    // 1️⃣ LEADS & FUNNEL STATS
    // 1️⃣ Parallelize Counts & Data Fetching
    const [totalLeads, convertedLeads, stages, totalStudents, activeStudents, joinedStudents, leftStudents, penalizedToday, topPenalized] = await Promise.all([
      this.prisma.lead.count({ where: { ...defaultWhere, created_at: { gte: startOfPeriod, lte: endOfPeriod } } }),
      this.prisma.lead.count({
        where: { 
          ...defaultWhere, 
          created_at: { gte: startOfPeriod, lte: endOfPeriod },
          converted_at: { not: null }
        }
      }),
      this.prisma.leadStage.findMany({
        where: { tenant_id: tenantId },
        include: { _count: { select: { leads: { where: { ...defaultWhere, created_at: { gte: startOfPeriod, lte: endOfPeriod } } } } } },
        orderBy: { order: 'asc' }
      }),
      this.prisma.student.count({ where: { ...defaultWhere, joined_at: { lte: endOfPeriod } } }),
      this.prisma.student.count({ where: { ...defaultWhere, status: 'ACTIVE', joined_at: { lte: endOfPeriod } } }),
      this.prisma.student.count({ where: { ...defaultWhere, joined_at: { gte: startOfPeriod, lte: endOfPeriod } } }),
      this.prisma.student.count({ where: { ...defaultWhere, joined_at: { gte: startOfPeriod, lte: endOfPeriod } } }),
      this.prisma.student.count({ where: { ...defaultWhere, is_archived: true, archived_at: { gte: startOfPeriod, lte: endOfPeriod } } }),
      this.getPenalizedToday(defaultWhere),
      this.getTopPenalized(tenantId, branchId)
    ]);

    const funnelData = stages.map(s => ({ name: s.name, count: s._count.leads }));
    
    const rawRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const conversionRate = Math.min(100, Math.round(rawRate));

    // 3️⃣ COURSE PERFORMANCE (Dynamic by Branch)
    const courses = await this.prisma.course.findMany({
      where: { tenant_id: tenantId, branch_id: (branchId && branchId !== 'all') ? branchId : undefined },
      include: {
        groups: {
          where: { ...defaultWhere },
          include: {
            enrollments: { where: { enrolled_at: { lte: endOfPeriod } } },
            revenueSegments: {
              where: { date: { gte: startOfPeriod, lte: endOfPeriod } }
            }
          }
        }
      }
    });

    const coursePerformance = (courses as any[]).map(c => {
      let studentCount = 0;
      let revenue = 0;
      c.groups?.forEach((g: any) => {
        studentCount += g.enrollments?.length || 0;
        revenue += g.revenueSegments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
      });
      return { name: c.name, studentCount, revenue };
    }).sort((a, b) => b.studentCount - a.studentCount).slice(0, 5);

    // 4️⃣ CAPACITY UTILIZATION
    const activeGroups = await this.prisma.group.findMany({
      where: { ...defaultWhere, is_archived: false },
      include: { _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } } }
    });
    const capacityData = activeGroups.map(g => ({
       name: g.name,
       capacity: g.capacity,
       current: g._count.enrollments,
       percent: g.capacity > 0 ? Math.round((g._count.enrollments / g.capacity) * 100) : 0
    })).sort((a,b) => b.percent - a.percent).slice(0, 5);

    // 5️⃣ PAYMENT METHODS
    const paymentsByMethod = await this.prisma.payment.groupBy({
      by: ['type'],
      where: { ...defaultWhere, created_at: { gte: startOfPeriod, lte: endOfPeriod }, status: 'SUCCESS' },
      _sum: { amount: true }
    });
    const paymentMethodData = paymentsByMethod.map(p => ({
       name: p.type === 'CASH' ? 'Naqd' : p.type === 'CARD' ? 'Karta' : 'O\'tkazma',
       value: Number(p._sum.amount),
       count: 0
    }));

    // 6️⃣ INVENTORY SALES
    const sales = await this.prisma.saleTransaction.aggregate({
      where: { ...defaultWhere, created_at: { gte: startOfPeriod, lte: endOfPeriod }, status: 'SUCCESS' },
      _sum: { amount: true }
    });
    const inventoryRevenue = Number(sales._sum?.amount || 0);

    // 📉 CHART DATA
    const chartData = await this.getTrendData(tenantId, branchId, startOfPeriod, endOfPeriod);
    
    // 👥 STUDENTS JOIN TREND (30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const studentsChartData = await this.getStudentTrendData(tenantId, branchId, thirtyDaysAgo, new Date());

    // 🚀 OTHER STATS
    const debtorsSum = await this.prisma.student.aggregate({
      where: { ...defaultWhere, status: 'DEBTOR', joined_at: { lte: endOfPeriod } },
      _sum: { balance: true }
    });
    const totalDebtAmount = Math.abs(Number(debtorsSum._sum?.balance || 0));

    // Stats were only period-based, making them all-time for dashboard accuracy
    const boysCount = await this.prisma.student.count({
      where: { ...defaultWhere, user: { gender: 'Erkak' }, joined_at: { lte: endOfPeriod } }
    });
    const girlsCount = await this.prisma.student.count({
      where: { ...defaultWhere, user: { gender: 'Ayol' }, joined_at: { lte: endOfPeriod } }
    });

    const [recentPayments, recentLeads] = await Promise.all([
      this.prisma.payment.findMany({
        where: { ...defaultWhere, created_at: { gte: startOfPeriod, lte: endOfPeriod } },
        take: 5, orderBy: { created_at: 'desc' },
        include: { student: { include: { user: true } } }
      }),
      this.prisma.lead.findMany({
        where: { ...defaultWhere, created_at: { gte: startOfPeriod, lte: endOfPeriod } },
        take: 5, orderBy: { created_at: 'desc' }
      })
    ]);

    const latestPayments = recentPayments.map(p => ({
      id: p.id,
      studentName: p.student?.user ? `${p.student.user.first_name} ${p.student.user.last_name}` : 'Noma\'lum',
      amount: Number(p.amount),
      date: p.created_at,
    }));

    const recentActivities = [
      ...recentPayments.map(p => ({
        type: 'PAYMENT',
        title: 'Yangi to\'lov qabul qilindi',
        description: p.student?.user ? `${p.student.user.first_name} tomonidan` : 'Talaba tomonidan',
        amount: Number(p.amount),
        date: p.created_at,
        icon: 'CreditCard'
      })),
      ...recentLeads.map(l => ({
        type: 'LEAD',
        title: 'Yangi lid ro\'yxatdan o\'tdi',
        description: `${l.name} (${l.phone})`,
        date: l.created_at,
        icon: 'UserPlus'
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    const performanceData = await this.getPerformanceTrend(startOfPeriod, endOfPeriod, defaultWhere);
    
    return {
      stats: {
        leads: { total: totalLeads, selected: totalLeads, converted: convertedLeads, conversionRate },
        students: { active: activeStudents, total: totalStudents, joined: joinedStudents, left: leftStudents },
        gender: { boys: boysCount, girls: girlsCount, total: joinedStudents || 1 },
        debtors: { 
          total: await this.prisma.student.count({ where: { ...defaultWhere, status: 'DEBTOR', joined_at: { lte: endOfPeriod } } }), 
          amount: totalDebtAmount 
        },
        teachers: {
           total: await this.prisma.teacher.count({ where: { ...defaultWhere, is_archived: false } }),
           main: await this.prisma.teacher.count({ where: { ...defaultWhere, is_archived: false, taughtGroups: { some: {} } } }),
           support: await this.prisma.teacher.count({ where: { ...defaultWhere, is_archived: false, supportedGroups: { some: {} } } })
        },
        staff: {
           total: await this.prisma.staff.count({ where: { tenant_id: tenantId, branch_id: branchId !== 'all' ? branchId : undefined } })
        }
      },
      funnelData,
      coursePerformance,
      capacityData,
      paymentMethodData,
      inventoryRevenue,
      chartData,
      studentsChartData,
      recentActivities,
      topDebtors: await this.getTopDebtors(defaultWhere),
      performanceData,
      absentStudentsToday: await this.getAbsentStudents(defaultWhere),
      penalizedTeachersToday: penalizedToday,
      topPenalizedTeachers: topPenalized,
      latestPayments,
      notifications: []
    };

  }

  private async getTrendData(tenantId: string, branchId: string | undefined, start: Date, end: Date) {
    const diff = end.getTime() - start.getTime();
    const segments = 7;
    const step = diff / segments;
    const trend: any[] = [];
    for (let i = 0; i < segments; i++) {
        const s = new Date(start.getTime() + (i * step));
        const e = new Date(start.getTime() + ((i + 1) * step));
        const rev = await this.prisma.revenueSegment.aggregate({
          where: { tenant_id: tenantId, branch_id: branchId !== 'all' ? branchId : undefined, date: { gte: s, lte: e } },
          _sum: { amount: true }
        });
        trend.push({ name: s.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }), revenue: Number(rev._sum.amount || 0) });
    }
    return trend;
  }

  private async getStudentTrendData(tenantId: string, branchId: string | undefined, start: Date, end: Date) {
    const diff = end.getTime() - start.getTime();
    const segments = 6; // Har 5 kunda bitta nuqta (30 kun uchun)
    const step = diff / segments;
    const trend: any[] = [];
    for (let i = 0; i < segments; i++) {
        const s = new Date(start.getTime() + (i * step));
        const e = new Date(start.getTime() + ((i + 1) * step));
        const count = await this.prisma.student.count({
          where: { 
            tenant_id: tenantId, 
            branch_id: branchId !== 'all' ? branchId : undefined, 
            joined_at: { gte: s, lte: e } 
          }
        });
        trend.push({ name: s.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }), count });
    }
    return trend;
  }

  private async getPerformanceTrend(start: Date, end: Date, where: any) {
    const grades = await this.prisma.grade.findMany({
       where: { student: { ...where }, created_at: { gte: start, lte: end } },
       include: { exam: true }
    });
    
    if (grades.length === 0) return [{ name: 'O\'rtacha', avg: 0 }];

    const filteredGrades = grades.filter(g => g.exam && g.exam.max_score > 0);
    if (filteredGrades.length === 0) return [{ name: 'O\'rtacha', avg: 0 }];

    const avg = Math.round(filteredGrades.reduce((a, b) => a + (b.score / b.exam.max_score * 100), 0) / filteredGrades.length);
    return [{ name: 'O\'rtacha', avg }];
  }


  private async getTopDebtors(where: any) {
    return this.prisma.student.findMany({
      where: { ...where, status: 'DEBTOR' },
      take: 5,
      orderBy: { balance: 'asc' },
      include: { user: true }
    }).then(res => res.map(d => ({ id: d.id, name: `${d.user.first_name} ${d.user.last_name}`, amount: Math.abs(Number(d.balance)) })));
  }

  private async getAbsentStudents(where: any) {
    const today = new Date();
    today.setHours(0,0,0,0);
    return this.prisma.attendance.findMany({
      where: { date: today, status: 'ABSENT', enrollment: { student: where } },
      include: { enrollment: { include: { student: { include: { user: true } }, group: true } } },
      take: 5
    }).then(res => res.map(a => ({ name: `${a.enrollment.student.user.first_name} ${a.enrollment.student.user.last_name}`, group: a.enrollment.group.name })));
  }

  async getNotifications(tenantId: string) {
    const stats = await this.getDashboardStats(tenantId);
    return stats.notifications;
  }

  async getLeadsReport(tenantId: string, branchId?: string, startDate?: string, endDate?: string) {
    const where: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') {
      where.branch_id = branchId;
    }

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();
    where.created_at = { gte: start, lte: end };

    const [totalLeads, convertedLeads, archivedLeads, stages, sources, managers, leads, reasonsData, leadsWithNotes] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, status: 'CONVERTED', converted_at: { not: null } } }),
      this.prisma.lead.count({ where: { ...where, status: 'ARCHIVED' } }),
      this.prisma.leadStage.findMany({
        where: { tenant_id: tenantId },
        include: { _count: { select: { leads: { where } } } },
        orderBy: { order: 'asc' }
      }),
      this.prisma.leadSource.findMany({
        where: { tenant_id: tenantId },
        include: { _count: { select: { leads: { where } } } }
      }),
      this.prisma.user.findMany({
        where: { tenant_id: tenantId, role: { slug: { in: ['admin', 'manager'] } } },
        include: { _count: { select: { managedLeads: { where } } } }
      }),
      this.prisma.lead.findMany({
        where: { ...where, status: { notIn: ['ARCHIVED'] } },
        take: 50,
        orderBy: { created_at: 'desc' },
        include: { stage: true, source: true, manager: true }
      }),
      this.prisma.lead.groupBy({
        by: ['archive_reason'],
        where: { ...where, status: 'ARCHIVED' },
        _count: true
      }),
      this.prisma.lead.count({ 
        where: { 
          ...where, 
          status: 'ARCHIVED',
          notes: { not: null, notIn: [''] } 
        } 
      })
    ]);

    const funnelData = stages.map(s => ({ name: s.name, count: s._count.leads }));
    const sourceData = sources.map(s => ({ name: s.name, value: s._count.leads }));
    const managerData = managers.map(m => ({ 
      name: `${m.first_name} ${m.last_name}`, 
      count: m._count.managedLeads 
    })).filter(m => m.count > 0);

    const trendData = await this.getLeadsTrend(tenantId, branchId, start, end);
    const dropoutTrend = await this.getLeadsTrend(tenantId, branchId, start, end, 'ARCHIVED');

    const totalActiveLeads = totalLeads - archivedLeads;

    return {
      stats: {
        total: totalLeads,
        converted: convertedLeads,
        archived: archivedLeads,
        active: totalActiveLeads,
        conversionRate: totalActiveLeads > 0 ? Math.round((convertedLeads / totalActiveLeads) * 100) : 0,
        dropoutRate: totalLeads > 0 ? Math.round((archivedLeads / totalLeads) * 100) : 0,
      },
      funnelData,
      sourceData,
      managerData,
      trendData,
      dropout: {
        reasonsData: reasonsData.map(r => ({ name: r.archive_reason || 'Boshqa', value: r._count })),
        trendData: dropoutTrend,
        topReason: reasonsData.sort((a,b) => b._count - a._count)[0]?.archive_reason || 'N/A',
        notesRate: archivedLeads > 0 ? Math.round((leadsWithNotes / archivedLeads) * 100) : 0
      },
      leads: leads.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        status: l.status,
        date: l.created_at,
        stage: l.stage?.name || 'Noma\'lum',
        source: l.source?.name || 'Noma\'lum',
        manager: l.manager ? `${l.manager.first_name} ${l.manager.last_name}` : 'Biriktirilmagan'
      }))
    };
  }

  private async getLeadsTrend(tenantId: string, branchId: string | undefined, start: Date, end: Date, status?: string) {
    const diff = end.getTime() - start.getTime();
    const segments = 10;
    const step = diff / segments;
    const trend: any[] = [];
    for (let i = 0; i < segments; i++) {
        const s = new Date(start.getTime() + (i * step));
        const e = new Date(start.getTime() + ((i + 1) * step));
        const count = await this.prisma.lead.count({
          where: { 
            tenant_id: tenantId, 
            branch_id: branchId !== 'all' ? branchId : undefined, 
            created_at: { gte: s, lte: e },
            status: status || undefined
          }
        });
        trend.push({ name: s.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }), count });
    }
    return trend;
  }

  async getAttendanceReport(tenantId: string, branchId?: string, startDate?: string, endDate?: string) {
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

    const [totalRecords, presentCount, unexcusedCount, attendanceTrend] = await Promise.all([
      this.prisma.attendance.count({ where: { ...where, date: { gte: start, lte: end } } }),
      this.prisma.attendance.count({ where: { ...where, date: { gte: start, lte: end }, status: { in: ['PRESENT', 'LATE'] } } }),
      this.prisma.attendance.count({ where: { ...where, date: { gte: start, lte: end }, status: 'ABSENT' } }),
      this.getAttendanceTrend(where, start, end)
    ]);

    const overallRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    return {
      stats: {
        overall: `${overallRate}%`,
        unexcused: unexcusedCount,
        total: totalRecords
      },
      trend: attendanceTrend
    };
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

  private async getPenalizedToday(where: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const penalties = await this.prisma.penalty.findMany({
      where: { 
        tenant_id: where.tenant_id,
        branch_id: where.branch_id,
        created_at: { gte: today } 
      },
      include: { 
        teacher: { include: { user: true } }, 
        group: true 
      },
      take: 5,
      orderBy: { created_at: 'desc' }
    });
    return penalties.map(p => ({
      teacherName: `${p.teacher.user.first_name} ${p.teacher.user.last_name}`,
      groupName: p.group?.name || 'Noma\'lum',
      amount: Number(p.amount),
      date: p.created_at
    }));
  }

  private async getTopPenalized(tenantId: string, branchId?: string) {
    const top = await this.prisma.penalty.groupBy({
      by: ['teacher_id'],
      where: { 
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined
      },
      _count: { teacher_id: true },
      _sum: { amount: true },
      orderBy: { _count: { teacher_id: 'desc' } },
      take: 5
    });

    return await Promise.all(top.map(async p => {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: p.teacher_id },
        include: { user: true }
      });
      return {
        name: `${teacher?.user?.first_name} ${teacher?.user?.last_name}`,
        count: p._count.teacher_id,
        totalAmount: Number(p._sum.amount)
      };
    }));
  }
}
