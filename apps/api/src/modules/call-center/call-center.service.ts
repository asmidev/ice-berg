import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CallCenterService {
  constructor(private prisma: PrismaService) {}

  async getDebtors(tenantId: string, branchId?: string, query?: any) {
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
  }

  async getNewLeads(tenantId: string, branchId?: string, query?: any) {
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
  }

  async getAbsentees(tenantId: string, branchId?: string, query?: any) {
    // Muzlatilgan (FROZEN) yoki dars qoldirgan talabalarni topish
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
  }

  async saveInteraction(tenantId: string, data: {
    studentId: string;
    taskId?: string; // If updating existing task
    staffId?: string; // Operator who handled the call
    branchId?: string;
    type: string; // DEBTOR, NEW_LEAD, ABSENTEE
    note: string;
    nextCallAt?: string;
    promisedDate?: string;
    status: string; // CALLED, RESOLVED
  }) {
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
    return this.prisma.callCenterTask.create({
      data: {
        tenant_id: tenantId,
        branch_id: data.branchId,
        student_id: data.studentId,
        staff_id: data.staffId,
        type: data.type,
        status: data.status,
        note: data.note,
        last_call_at: new Date(),
        next_call_at: data.nextCallAt ? new Date(data.nextCallAt) : null,
        promised_date: data.promisedDate ? new Date(data.promisedDate) : null,
      }
    });
  }

  async resolveTask(taskId: string) {
    return this.prisma.callCenterTask.update({
      where: { id: taskId },
      data: { status: 'RESOLVED' }
    });
  }
}
