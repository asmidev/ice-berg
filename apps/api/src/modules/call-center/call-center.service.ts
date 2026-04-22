import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class CallCenterService {
  constructor(private prisma: PrismaService) {}

  async getDebtors(tenantId: string, branchId?: string, query?: any) {
    try {
      const where: any = { 
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        OR: [
          { invoices: { some: { status: { in: ['UNPAID', 'PARTIAL'] } } } },
          { balance: { lt: 0 } },
          { course_balance: { lt: 0 } },
          { book_balance: { lt: 0 } },
          { mock_balance: { lt: 0 } },
          { status: 'DEBTOR' }
        ]
      };

      if (query?.status && query.status !== 'all') {
        where.status = query.status;
      }

      if (query?.search) {
        where.user = {
          OR: [
            { first_name: { contains: query.search, mode: 'insensitive' } },
            { last_name: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } }
          ]
        };
      }

      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 20;
      const skip = (page - 1) * limit;

      const [total, data] = await Promise.all([
        this.prisma.student.count({ where }),
        this.prisma.student.findMany({
          where,
          include: {
            user: true,
            branch: true,
            invoices: {
              where: { status: { in: ['UNPAID', 'PARTIAL'] } },
              include: { group: true }
            },
            callCenterTasks: {
              where: { status: { in: ['PENDING', 'CALLED'] } },
              include: { staff: { select: { first_name: true, last_name: true } } },
              orderBy: { created_at: 'desc' },
              take: 1
            }
          },
          skip,
          take: limit,
          orderBy: { balance: 'asc' } 
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
    } catch (e: any) {
      console.error("GET DEBTORS ERROR", e);
      throw e;
    }
  }

  async getNewLeads(tenantId: string, branchId?: string, query?: any) {
    try {
      const where: any = {
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        payments: { none: { status: 'SUCCESS' } },
        is_archived: false,
        status: { notIn: ['GRADUATED', 'REMOVED'] }
      };

      if (query?.search) {
        where.user = {
          OR: [
            { first_name: { contains: query.search, mode: 'insensitive' } },
            { last_name: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } }
          ]
        };
      }

      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 20;
      const skip = (page - 1) * limit;

      const [total, data] = await Promise.all([
        this.prisma.student.count({ where }),
        this.prisma.student.findMany({
          where,
          include: {
            user: true,
            branch: true,
            enrollments: {
              include: { group: true }
            },
            callCenterTasks: {
              where: { status: { in: ['PENDING', 'CALLED'] } },
              include: { staff: { select: { first_name: true, last_name: true } } },
              orderBy: { created_at: 'desc' },
              take: 1
            }
          },
          skip,
          take: limit,
          orderBy: { joined_at: 'desc' }
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
    } catch (e: any) {
      console.error("GET NEW LEADS ERROR", e);
      throw e;
    }
  }

  async getAbsentees(tenantId: string, branchId?: string, query?: any) {
    try {
      const where: any = {
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        is_archived: false,
        OR: [
          { enrollments: { some: { status: 'FROZEN' } } },
          { status: 'FROZEN' },
          { callCenterTasks: { some: { type: 'ABSENTEE', status: { in: ['PENDING', 'CALLED'] } } } }
        ]
      };

      if (query?.search) {
        where.user = {
          OR: [
            { first_name: { contains: query.search, mode: 'insensitive' } },
            { last_name: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } }
          ]
        };
      }

      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 20;
      const skip = (page - 1) * limit;

      const [total, data] = await Promise.all([
        this.prisma.student.count({ where }),
        this.prisma.student.findMany({
          where,
          include: {
            user: true,
            branch: true,
            enrollments: {
              where: { status: 'FROZEN' },
              include: { group: true }
            },
            callCenterTasks: {
              where: { status: { in: ['PENDING', 'CALLED'] } },
              include: { staff: { select: { first_name: true, last_name: true } } },
              orderBy: { created_at: 'desc' },
              take: 1
            }
          },
          skip,
          take: limit,
          orderBy: { joined_at: 'desc' }
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
    } catch (e: any) {
      console.error("GET ABSENTEES ERROR", e);
      throw e;
    }
  }

  async getLeads(tenantId: string, branchId?: string, query?: any) {
    try {
      const where: any = {
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        student: null, // Faqat talabaga aylanmagan lidlar
        status: 'ACTIVE'
      };

      if (query?.type === 'TRIAL_NO_SHOW') {
        where.trial_date = { lt: new Date() };
        where.trial_status = 'PENDING';
      } else if (query?.type === 'TRIAL_NO_ENROLL') {
        where.trial_status = 'ATTENDED';
        // Hali o'quvchiga aylanmaganligi yuqoridagi student: null orqali kafolatlanadi
      }

      if (query?.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } }
        ];
      }

      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 20;
      const skip = (page - 1) * limit;

      const [total, data] = await Promise.all([
        this.prisma.lead.count({ where }),
        (this.prisma.lead as any).findMany({
          where,
          include: {
            branch: true,
            manager: { select: { first_name: true, last_name: true } },
            course: true,
            promotion: { select: { name: true } },
            callCenterTasks: {
              where: { status: { in: ['PENDING', 'CALLED'] } },
              include: { staff: { select: { first_name: true, last_name: true } } },
              orderBy: { created_at: 'desc' },
              take: 1
            }
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' }
        })
      ]);

      // UI uchun Student-ga o'xshash strukturaga keltiramiz
      const formattedData = data.map((lead: any) => ({
        ...lead,
        isLead: true,
        user: {
          first_name: lead.name,
          last_name: '',
          phone: lead.phone
        },
        enrollments: lead.course ? [{ group: { name: lead.course.name } }] : [],
        promotionName: lead.promotion?.name || null,
        invoices: []
      }));

      return {
        data: formattedData,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (e: any) {
      console.error("GET LEADS ERROR", e);
      throw e;
    }
  }

  async updateLeadTrial(tenantId: string, leadId: string, data: { trialStatus?: string, trialDate?: string }) {
    try {
      return await this.prisma.lead.update({
        where: { id: leadId, tenant_id: tenantId },
        data: {
          trial_status: data.trialStatus,
          trial_date: data.trialDate ? new Date(data.trialDate) : undefined
        }
      });
    } catch (e: any) {
      console.error("UPDATE LEAD TRIAL ERROR", e);
      throw e;
    }
  }

  async saveInteraction(tenantId: string, data: {
    studentId?: string;
    leadId?: string;
    taskId?: string; // If updating existing task
    staffId?: string; // Operator who handled the call
    branchId?: string;
    type: string; // DEBTOR, NEW_LEAD, ABSENTEE, LEAD
    note: string;
    nextCallAt?: string;
    promisedDate?: string;
    status: string; // CALLED, RESOLVED
  }) {
    try {
      if (data.taskId) {
        return this.prisma.callCenterTask.update({
          where: { id: data.taskId },
          data: {
            status: data.status,
            note: data.note,
            staff_id: data.staffId,
            last_call_at: new Date(),
            next_call_at: data.nextCallAt ? new Date(data.nextCallAt) : null,
            promised_date: data.promisedDate ? new Date(data.promisedDate) : null,
          }
        });
      }

      // Create new task if it doesn't exist
      return (this.prisma.callCenterTask as any).create({
        data: {
          tenant_id: tenantId,
          branch_id: data.branchId,
          student_id: data.studentId || null,
          lead_id: data.leadId || null,
          staff_id: data.staffId,
          type: data.type,
          status: data.status,
          note: data.note,
          last_call_at: new Date(),
          next_call_at: data.nextCallAt ? new Date(data.nextCallAt) : null,
          promised_date: data.promisedDate ? new Date(data.promisedDate) : null,
        }
      });
    } catch (e: any) {
      console.error("SAVE INTERACTION ERROR", e);
      throw e;
    }
  }

  async resolveTask(taskId: string) {
    try {
      return this.prisma.callCenterTask.update({
        where: { id: taskId },
        data: { status: 'RESOLVED' }
      });
    } catch (e: any) {
      console.error("RESOLVE TASK ERROR", e);
      throw e;
    }
  }

  async exportLeadsToExcel(tenantId: string, branchId?: string, query?: any) {
    try {
      let data: any[] = [];
      let filename = 'export.xlsx';

      if (query.category === 'KELMAGAN') {
        // Sinov darsiga kelmaganlar
        const leads = await this.prisma.lead.findMany({
          where: {
            tenant_id: tenantId,
            branch_id: branchId && branchId !== 'all' ? branchId : undefined,
            trial_status: 'NO_SHOW'
          },
          include: { source: true, course: true }
        });
        data = leads.map(l => ({
          'Ism': l.name,
          'Telefon': l.phone,
          'Manba': l.source?.name || '',
          'Kurs': l.course?.name || '',
          'Sinov sanasi': l.trial_date?.toLocaleDateString() || '',
          'Izoh': l.notes || ''
        }));
        filename = 'sinovga_kelmaganlar.xlsx';
      } else if (query.category === 'KELGAN') {
        // Sinov darsiga kelganlar
        const leads = await this.prisma.lead.findMany({
          where: {
            tenant_id: tenantId,
            branch_id: branchId && branchId !== 'all' ? branchId : undefined,
            trial_status: 'ATTENDED'
          },
          include: { source: true, course: true }
        });
        data = leads.map(l => ({
          'Ism': l.name,
          'Telefon': l.phone,
          'Manba': l.source?.name || '',
          'Kurs': l.course?.name || '',
          'Sinov sanasi': l.trial_date?.toLocaleDateString() || '',
          'Holati': l.status === 'CONVERTED' ? 'Guruhga yozildi' : 'Yozilmadi',
          'Izoh': l.notes || ''
        }));
        filename = 'sinovga_kelganlar.xlsx';
      } else if (query.category === 'TOHTATGAN') {
        // Keyin kelishni to'xtatganlar (Removed students)
        const students = await this.prisma.student.findMany({
          where: {
            tenant_id: tenantId,
            branch_id: branchId && branchId !== 'all' ? branchId : undefined,
            status: 'REMOVED'
          },
          include: { user: true, enrollments: { include: { group: true } } }
        });
        data = students.map(s => ({
          'Ism': `${s.user.first_name} ${s.user.last_name}`,
          'Telefon': s.user.phone,
          'Guruh': s.enrollments?.[0]?.group?.name || '',
          'Chiqish sanasi': (s as any).left_at?.toLocaleDateString() || '',
          'Sabab': (s as any).archive_reason || ''
        }));
        filename = 'chiqib_ketganlar.xlsx';
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return {
        buffer: buffer.toString('base64'),
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    } catch (e: any) {
      console.error("EXPORT ERROR", e);
      throw e;
    }
  }
}
