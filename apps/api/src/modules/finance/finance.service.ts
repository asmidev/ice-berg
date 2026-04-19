import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService
  ) {}

  async getCashboxes(tenantId: string, branchId?: string) {
    const where: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') {
      where.branch_id = branchId;
    }
    return this.prisma.cashbox.findMany({
      where,
      include: { branch: true }
    });
  }

  async getUnpaidInvoices(tenantId: string, studentId: string) {
    return this.prisma.invoice.findMany({
      where: { 
        tenant_id: tenantId, 
        student_id: studentId, 
        status: { in: ['UNPAID', 'PARTIAL'] } 
      },
      orderBy: { created_at: 'asc' },
      include: { group: { select: { name: true } } }
    });
  }

  async processPayment(tenantId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      // --- Multiple Invoices Payment Logic ---
      if (data.invoice_ids && data.invoice_ids.length > 0) {
        let totalPaid = 0;
        const payments = [];
        
        for (const invId of data.invoice_ids) {
          const invoice = await tx.invoice.findUnique({ where: { id: invId } });
          if (!invoice || invoice.status === 'PAID') continue;

          // Qancha qarz qolgan?
          const leftToPay = Number(invoice.amount) - Number(invoice.paid_amount);

          const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
          const catId = data.category_id && isUuid(data.category_id) ? data.category_id : null;

          const payment = await tx.payment.create({
            data: {
              tenant_id: tenantId,
              branch_id: data.branch_id || invoice.branch_id || null,
              student_id: data.student_id || invoice.student_id || null,
              group_id: invoice.group_id,
              cashbox_id: data.cashbox_id || null,
              cashier_id: data.cashier_id || null,
              amount: leftToPay,
              type: data.type || 'CASH',
              status: 'SUCCESS',
              invoice_id: invoice.id,
              paid_for_month: invoice.month,
              category_id: catId,
              description: data.description,
            },
          });
          payments.push(payment);
          totalPaid += leftToPay;

          // Invoice ni PAID qilish
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PAID', paid_amount: invoice.amount }
          });
          
          await tx.transaction.create({
             data: { payment_id: payment.id, amount: leftToPay, balance_before: 0, balance_after: leftToPay }
          });

          // --- Accrual Split Logic ---
          if (invoice.type === 'COURSE' && invoice.start_date && invoice.end_date && invoice.group_id) {
             await this.createRevenueSegments(tx, tenantId, payment.id, invoice.group_id, leftToPay, invoice.start_date, invoice.end_date);
          }
        }
        
        // Talaba Umumiy hisobini (Balance) va Statusini yangilash
        if (data.student_id) {
           await tx.student.update({
             where: { id: data.student_id },
             data: { balance: { increment: totalPaid }, course_balance: { increment: totalPaid } }
           });
           const std = await tx.student.findUnique({ where: { id: data.student_id }, include: { user: true }});
           if (Number(std?.balance) >= 0) {
             await tx.student.update({ where: { id: data.student_id }, data: { status: 'ACTIVE' } });
           }

           // --- SMS Trigger ---
           if (std?.user?.phone) {
              this.smsService.handleTrigger(tenantId, data.branch_id, 'PAYMENT', {
                studentName: `${std.user.first_name} ${std.user.last_name}`,
                amount: totalPaid,
                date: new Date().toLocaleDateString()
              }, std.user.phone);
           }
        }

        // Kassa balansi
        if (data.cashbox_id) {
           const isCash = data.payment_method === 'CASH' || data.type === 'CASH';
           await tx.cashbox.update({
             where: { id: data.cashbox_id },
             data: { [isCash ? 'balance' : 'balance_other']: { increment: totalPaid } }
           });
        }

        return payments[0]; // Bitta to'lov return qilamiz eski moslik uchun
      }

      // --- 1. Single Custom Payment (Fallback/Tanish odam uchun vs) ---
      const payment = await tx.payment.create({
        data: {
          tenant_id: tenantId,
          branch_id: data.branch_id || null,
          student_id: data.student_id || null,
          group_id: data.group_id || null,
          cashbox_id: data.cashbox_id || null,
          cashier_id: data.cashier_id || null,
          amount: data.amount,
          type: data.type || 'INCOME',
          status: data.status || 'SUCCESS',
          external_id: data.external_id,
          description: data.description,
        },
      });

      // 2. Update Student Balance and Status
      if (data.student_id) {
        const debtType = data.debt_type; // COURSE, BOOK, MOCK
        const updateData: any = {
          balance: { increment: data.amount }
        };
        
        if (debtType === 'COURSE') updateData.course_balance = { increment: data.amount };
        else if (debtType === 'BOOK') updateData.book_balance = { increment: data.amount };
        else if (debtType === 'MOCK') updateData.mock_balance = { increment: data.amount };
        else updateData.course_balance = { increment: data.amount };

        const updatedStudent = await tx.student.update({
          where: { id: data.student_id },
          data: updateData
        });

        // 3. Update Status if debt cleared
        const student = await tx.student.findUnique({
          where: { id: data.student_id },
          include: { user: true }
        });

        if (student && Number(student.balance) >= 0) {
          await tx.student.update({
            where: { id: data.student_id },
            data: { status: 'ACTIVE' }
          });
        }

        // --- SMS Trigger ---
        if (student?.user?.phone) {
           this.smsService.handleTrigger(tenantId, data.branch_id, 'PAYMENT', {
             studentName: `${student.user.first_name} ${student.user.last_name}`,
             amount: data.amount,
             date: new Date().toLocaleDateString()
           }, student.user.phone);
        }
      }

      // 4. Update Cashbox Balance
      if (data.cashbox_id) {
        const isCash = payment.type === 'CASH';
        await tx.cashbox.update({
          where: { id: data.cashbox_id },
          data: { 
            [isCash ? 'balance' : 'balance_other']: { increment: data.amount } 
          }
        });
      }

      // 5. Create Transaction Log
      await tx.transaction.create({
        data: {
          payment_id: payment.id,
          amount: data.amount,
          balance_before: 0,
          balance_after: data.amount, // Simplified
        },
      });

      return payment;
    });
  }

  async getSales(tenantId: string, branchId?: string, query?: any) {
    const where: any = { tenant_id: tenantId };
    
    // Sukut bo'yicha arxivlanmaganlarni ko'rsatish
    where.is_archived = query?.is_archived === 'true';

    if (branchId && branchId !== 'all') {
      where.branch_id = branchId;
    }

    if (query?.search) {
      where.OR = [
        { customer_name: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { student: { user: { first_name: { contains: query.search, mode: 'insensitive' } } } },
        { student: { user: { last_name: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    if (query?.startDate || query?.endDate) {
      where.created_at = {};
      if (query.startDate) where.created_at.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    return this.prisma.saleTransaction.findMany({
      where,
      include: {
        student: { include: { user: true } },
        customer: true,
        staff: true,
        items: { include: { product: true } },
        branch: true,
        cashbox: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async recordSale(tenantId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Sale Transaction
      const sale = await tx.saleTransaction.create({
        data: {
          tenant_id: tenantId,
          branch_id: data.branch_id,
          amount: data.amount,
          payment_method: data.payment_method,
          student_id: data.student_id,
          customer_id: data.customer_id,
          staff_id: data.staff_id,
          cashbox_id: data.cashbox_id,
          description: data.description,
          items: {
            create: data.items.map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price_at_sale: item.price,
            })),
          },
        },
      });

      // 2. Update Product Stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Update Cashbox Balance
      if (data.cashbox_id) {
        const isCash = data.payment_method === 'CASH';
        await tx.cashbox.update({
          where: { id: data.cashbox_id },
          data: { 
            [isCash ? 'balance' : 'balance_other']: { increment: data.amount } 
          }
        });
      }

      return sale;
    });
  }

  async archiveSale(tenantId: string, id: string, reason?: string) {
    return this.prisma.saleTransaction.update({
      where: { id, tenant_id: tenantId },
      data: {
        is_archived: true,
        archive_reason: reason,
        archived_at: new Date(),
      },
    });
  }

  async restoreSale(tenantId: string, id: string) {
    return this.prisma.saleTransaction.update({
      where: { id, tenant_id: tenantId },
      data: {
        is_archived: false,
        archived_at: null,
      },
    });
  }

  async getPaymentStats(tenantId: string, branchId?: string, period: string = '6_months', query?: any) {
    const where: any = { tenant_id: tenantId, is_archived: false };
    if (branchId && branchId !== 'all') {
      where.branch_id = branchId;
    }

    if (query?.search) {
      where.OR = [
        { student: { user: { first_name: { contains: query.search, mode: 'insensitive' } } } },
        { student: { user: { last_name: { contains: query.search, mode: 'insensitive' } } } },
        { id: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    if (query?.teacher_id && query.teacher_id !== 'all') {
      where.group = {
        OR: [
          { teacher_id: query.teacher_id },
          { support_teacher_id: query.teacher_id }
        ]
      };
    }
    if (query?.group_id && query.group_id !== 'all') {
      where.group_id = query.group_id;
    }
    if (query?.cashier_id && query.cashier_id !== 'all') {
      where.cashier_id = query.cashier_id;
    }
    if (query?.type && query.type !== 'all') {
      where.type = query.type;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const segments = await this.prisma.revenueSegment.findMany({
      where: {
        tenant_id: tenantId,
        branch_id: branchId !== 'all' ? branchId : undefined,
        // Boshqa filterlarni ham qo'shish mumkin agar segmentda bo'lsa
      },
      select: { amount: true, date: true }
    });

    let totalSum = 0;
    let todaySum = 0;

    segments.forEach(s => {
      const amt = Number(s.amount);
      totalSum += amt;
      if (new Date(s.date) >= today) {
        todaySum += amt;
      }
    });

    const archivedWhere = { ...where, is_archived: true };
    const archivedPayments = await this.prisma.payment.findMany({
      where: archivedWhere,
      select: { amount: true }
    });
    const archivedSum = archivedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const monthlyData: any[] = [];
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const fullMonthNames = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const shortDays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

    if (period === '1_week' || period === '1_month') {
      const days = period === '1_week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = d.getMonth();
        const dateString = String(d.getDate()).padStart(2, '0');
        
        const daySum = segments
          .filter(s => {
             const pd = new Date(s.date);
             return pd.getDate() === d.getDate() && pd.getMonth() === m && pd.getFullYear() === y;
          })
          .reduce((sum, s) => sum + Number(s.amount), 0);
          
        const name = period === '1_week' ? shortDays[d.getDay()] : `${dateString}/${String(m + 1).padStart(2, '0')}`;
        monthlyData.push({ name, Kirim: daySum });
      }
    } else {
      const months = period === '3_months' ? 3 : period === '6_months' ? 6 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const y = d.getFullYear();
        const m = d.getMonth();
        
        const monthSum = segments
          .filter(s => {
             const pd = new Date(s.date);
             return pd.getMonth() === m && pd.getFullYear() === y;
          })
          .reduce((sum, s) => sum + Number(s.amount), 0);
          
        monthlyData.push({ name: `${monthNames[m]}`, Kirim: monthSum });
      }
    }

    return { totalSum, todaySum, archivedSum, monthlyTrend: monthlyData };
  }

  async getTransactions(tenantId: string, query?: any) {
    const where: any = { tenant_id: tenantId };
    
    // Branch filter
    if (query?.branch_id && query.branch_id !== 'all') {
      where.branch_id = query.branch_id;
    }

    // Arxivlash filtri - Qat'iy mantiq
    if (query?.is_archived === 'true') {
      where.is_archived = true;
    } else {
      where.is_archived = false;
    }

    if (query?.search) {
      where.OR = [
        { student: { user: { first_name: { contains: query.search, mode: 'insensitive' } } } },
        { student: { user: { last_name: { contains: query.search, mode: 'insensitive' } } } },
        { id: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query?.teacher_id && query.teacher_id !== 'all') {
      where.group = {
        OR: [
          { teacher_id: query.teacher_id },
          { support_teacher_id: query.teacher_id }
        ]
      };
    }

    if (query?.group_id && query.group_id !== 'all') {
      where.group_id = query.group_id;
    }

    if (query?.cashier_id && query.cashier_id !== 'all') {
      where.cashier_id = query.cashier_id;
    }

    if (query?.type && query.type !== 'all') {
      where.type = query.type;
    }

    if (query?.startDate || query?.endDate) {
      where.created_at = {};
      if (query.startDate) where.created_at.gte = new Date(query.startDate);
      if (query.endDate) {
         const end = new Date(query.endDate);
         end.setHours(23, 59, 59, 999);
         where.created_at.lte = end;
      }
    }

    return this.prisma.payment.findMany({
      where,
      include: { 
        student: { include: { user: true } },
        cashbox: true,
        cashier: true,
        branch: true,
        group: {
          include: {
            teacher: { include: { user: true } },
            course: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getDebtors(tenantId: string, branchId?: string, query?: any) {
    const and: any[] = [
      { tenant_id: tenantId },
      { invoices: { some: { status: { in: ['UNPAID', 'PARTIAL'] } } } }
    ];

    if (branchId && branchId !== 'all') {
      and.push({ branch_id: branchId });
    }

    if (query?.phone) {
      let cleanPhone = query.phone.replace(/\D/g, '');
      if (cleanPhone.length > 9) {
        cleanPhone = cleanPhone.slice(-9);
      }
      and.push({ user: { phone: { contains: cleanPhone } } });
    }

    if (query?.search) {
      let searchVal = query.search;
      // Agar search raqamlardan iborat bo'lsa (va uzunligi > 7), uni ham phone kabi tozalaymiz
      const digitsOnly = searchVal.replace(/\D/g, '');
      if (digitsOnly.length >= 9) {
        searchVal = digitsOnly.slice(-9);
      }

      and.push({
        user: {
          OR: [
            { first_name: { contains: query.search, mode: 'insensitive' } },
            { last_name: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: searchVal } }
          ]
        }
      });
    }

    if (query?.group_id && query.group_id !== 'all') {
      and.push({ enrollments: { some: { group_id: query.group_id } } });
    }

    if (query?.teacher_id && query.teacher_id !== 'all') {
      and.push({ enrollments: { some: { group: { teacher_id: query.teacher_id } } } });
    }

    if (query?.room_id && query.room_id !== 'all') {
      and.push({ enrollments: { some: { group: { room_id: query.room_id } } } });
    }

    if (query?.day && query.day !== 'all') {
      and.push({ enrollments: { some: { group: { schedules: { some: { day_of_week: Number(query.day) } } } } } });
    }

    if (query?.status && query.status !== 'all') {
      and.push({ status: query.status });
    }

    if (query?.startDate || query?.endDate) {
      const dateFilter: any = {};
      if (query.startDate) dateFilter.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      
      // Update the invoices.some filter to include the date range
      const invoiceFilter = and.find(item => item.invoices);
      if (invoiceFilter) {
        invoiceFilter.invoices.some.created_at = dateFilter;
      }
    }

    const where = { AND: and };

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
          invoices: { where: { status: { in: ['UNPAID', 'PARTIAL'] } } },
          enrollments: {
            where: { status: 'ACTIVE' },
            include: {
              group: {
                include: {
                  schedules: true,
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { joined_at: 'desc' }
      })
    ]);

    const debtAggregation = await this.prisma.invoice.aggregate({
        where: {
            student: where,
            status: { in: ['UNPAID', 'PARTIAL'] }
        },
        _sum: {
            amount: true,
            paid_amount: true
        }
    });

    const totalDebtAmount = Number(debtAggregation._sum.amount || 0) - Number(debtAggregation._sum.paid_amount || 0);

    // Group Statistics for Chart
    const unpaidInvoices = await this.prisma.invoice.findMany({
       where: {
          student: where,
          status: { in: ['UNPAID', 'PARTIAL'] }
       },
       select: {
          amount: true,
          paid_amount: true,
          student: {
             select: {
                enrollments: {
                   where: { status: 'ACTIVE' },
                   select: { group: { select: { name: true } } }
                }
             }
          }
       }
    });

    const groupStats: Record<string, number> = {};
    unpaidInvoices.forEach(inv => {
       const debt = Number(inv.amount) - (Number(inv.paid_amount) || 0);
       const groups = inv.student?.enrollments || [];
       if (groups.length === 0) {
          groupStats['Boshqa'] = (groupStats['Boshqa'] || 0) + debt;
       } else {
          groups.forEach(g => {
             const gName = g.group?.name || 'Noma\'lum';
             groupStats[gName] = (groupStats[gName] || 0) + (debt / groups.length); // divide debt equally
          });
       }
    });

    const chartData = Object.keys(groupStats)
       .map(name => ({ name, debt: groupStats[name] }))
       .sort((a, b) => b.debt - a.debt)
       .slice(0, 10);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalDebt: totalDebtAmount,
        chartData
      }
    };
  }

  async recordExpense(tenantId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          tenant_id: tenantId,
          branch_id: data.branch_id || null,
          cashbox_id: data.cashbox_id || null,
          created_by: data.userId || null,
          amount: data.amount,
          category: data.category || '-',
          category_id: data.category_id || null,
          description: data.description,
          type: data.type || 'VARIABLE',
          payment_method: data.payment_method || 'CASH',
          source_type: data.source_type || 'KASSA',
          responsible_id: data.responsible_id || null,
          staff_id: data.staff_id || null,
          department_id: data.department_id || null,
          date: data.date ? new Date(data.date) : new Date(),
        },
      });

      // Kassa balansini ayirish (Naqd vs Card/Transfer)
      if (data.cashbox_id && data.source_type === 'KASSA') {
        const isCash = expense.payment_method === 'CASH';
        await tx.cashbox.update({
          where: { id: data.cashbox_id },
          data: { 
            [isCash ? 'balance' : 'balance_other']: { decrement: data.amount } 
          }
        });
      }

      return expense;
    });
  }

  async getExpenses(tenantId: string, query?: any) {
    const where: any = { tenant_id: tenantId };
    
    // Tab/Type filter
    if (query?.type && query.type !== 'all') {
      where.type = query.type;
    }

    // Branch filter
    if (query?.branch_id && query.branch_id !== 'all') {
      where.branch_id = query.branch_id;
    }

    // Archiving filter
    if (query?.is_archived === 'true') {
      where.is_archived = true;
    } else {
      where.is_archived = { not: true };
    }

    // Search
    if (query?.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { categoryRel: { name: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    // Secondary filters
    if (query?.staff_id && query.staff_id !== 'all') {
      where.staff_id = query.staff_id;
    }
    if (query?.responsible_id && query.responsible_id !== 'all') {
      where.responsible_id = query.responsible_id;
    }
    if (query?.department_id && query.department_id !== 'all') {
      where.department_id = query.department_id;
    }
    if (query?.payment_method && query.payment_method !== 'all') {
      where.payment_method = query.payment_method;
    }

    if (query?.startDate || query?.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    return this.prisma.expense.findMany({
      where,
      include: { 
        creator: true, 
        cashbox: true, 
        branch: true,
        responsible: { include: { role: true } },
        staff: { include: { role: true } },
        department: true,
        categoryRel: true
      },
      orderBy: { date: 'desc' },
    });
  }

  async archiveExpense(tenantId: string, id: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id, tenant_id: tenantId } });
      if (!expense) throw new Error('Expense not found');
      if (expense.is_archived) return expense;

      const updated = await tx.expense.update({
        where: { id, tenant_id: tenantId },
        data: {
          is_archived: true,
          archive_reason: reason,
          archived_at: new Date()
        }
      });

      // Refund cashbox
      if (expense.cashbox_id && expense.source_type === 'KASSA') {
        await tx.cashbox.update({
          where: { id: expense.cashbox_id },
          data: { balance: { increment: expense.amount } }
        });
      }

      return updated;
    });
  }

  async restoreExpense(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id, tenant_id: tenantId } });
      if (!expense) throw new Error('Expense not found');
      if (!expense.is_archived) return expense;

      const updated = await tx.expense.update({
        where: { id, tenant_id: tenantId },
        data: {
          is_archived: false,
          archived_at: null
        }
      });

      // Decrement cashbox again
      if (expense.cashbox_id && expense.source_type === 'KASSA') {
        await tx.cashbox.update({
          where: { id: expense.cashbox_id },
          data: { balance: { decrement: expense.amount } }
        });
      }

      return updated;
    });
  }

  async deleteExpense(tenantId: string, id: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id, tenant_id: tenantId } });
    if (!expense) throw new Error('Expense not found');
    if (!expense.is_archived) throw new Error('Faqat arxivlangan xarajatlarni o\'chirish mumkin');

    return this.prisma.expense.delete({ where: { id, tenant_id: tenantId } });
  }

  // --- CATEGORIES ---
  async getExpenseCategories(tenantId: string) {
    return this.prisma.expenseCategory.findMany({
      where: { tenant_id: tenantId, is_active: true },
      orderBy: { name: 'asc' }
    });
  }

  async saveExpenseCategory(tenantId: string, data: any) {
    if (data.id) {
      return this.prisma.expenseCategory.update({
        where: { id: data.id, tenant_id: tenantId },
        data: { name: data.name }
      });
    }
    return this.prisma.expenseCategory.create({
      data: { tenant_id: tenantId, name: data.name }
    });
  }

  async deleteExpenseCategory(tenantId: string, id: string) {
    return this.prisma.expenseCategory.update({
      where: { id, tenant_id: tenantId },
      data: { is_active: false }
    });
  }

  // --- DEPARTMENTS ---
  async getDepartments(tenantId: string) {
    return this.prisma.department.findMany({
      where: { tenant_id: tenantId },
      orderBy: { name: 'asc' }
    });
  }

  async saveDepartment(tenantId: string, data: any) {
    if (data.id) {
      return this.prisma.department.update({
        where: { id: data.id, tenant_id: tenantId },
        data: { name: data.name }
      });
    }
    return this.prisma.department.create({
      data: { tenant_id: tenantId, name: data.name }
    });
  }

  async deleteDepartment(tenantId: string, id: string) {
    return this.prisma.department.delete({ where: { id, tenant_id: tenantId } });
  }

  // --- PLANNING ---
  async getExpensePlans(tenantId: string, branchId?: string) {
    const where: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') where.branch_id = branchId;
    return this.prisma.expensePlan.findMany({
      where,
      include: { category: true, branch: true },
      orderBy: { date: 'asc' }
    });
  }

  async saveExpensePlan(tenantId: string, data: any) {
    if (data.id) {
      return this.prisma.expensePlan.update({
        where: { id: data.id, tenant_id: tenantId },
        data: {
          branch_id: data.branch_id,
          category_id: data.category_id,
          amount: data.amount,
          date: new Date(data.date),
          description: data.description
        }
      });
    }
    return this.prisma.expensePlan.create({
      data: {
        tenant_id: tenantId,
        branch_id: data.branch_id,
        category_id: data.category_id,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description
      }
    });
  }

  async deleteExpensePlan(tenantId: string, id: string) {
    return this.prisma.expensePlan.delete({ where: { id, tenant_id: tenantId } });
  }

  async generatePayroll(tenantId: string, data: any) {
    return this.prisma.payroll.create({
      data: {
        tenant_id: tenantId,
        branch_id: data.branch_id,
        teacher_id: data.teacher_id,
        staff_id: data.staff_id,
        amount: data.amount,
        bonus: data.bonus || 0,
        deduction: data.deduction || 0,
        period: data.period,
        status: 'PENDING',
        group_id: data.group_id || null,
      },
    });
  }

  async processPayroll(tenantId: string, payrollId: string, data: { cashbox_id: string, payment_method: string }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get Payroll
      const payroll = await tx.payroll.findUnique({
        where: { id: payrollId, tenant_id: tenantId },
      });

      if (!payroll) throw new Error('Payroll record not found');
      if (payroll.status === 'PAID') return payroll;

      const totalAmount = Number(payroll.amount) + Number(payroll.bonus) - Number(payroll.deduction);

      // 2. Update Payroll
      const updated = await tx.payroll.update({
        where: { id: payrollId, tenant_id: tenantId },
        data: { 
          status: 'PAID', 
          paid_at: new Date(),
          cashbox_id: data.cashbox_id,
          payment_method: data.payment_method
        },
      });

      // 3. Decrement Cashbox Balance
      if (data.cashbox_id) {
        await tx.cashbox.update({
          where: { id: data.cashbox_id },
          data: { balance: { decrement: totalAmount } }
        });
      }

      // 4. Create Payroll Segments for Accrual Stats
      if (updated.group_id && updated.teacher_id) {
         await this.createPayrollSegments(tx, tenantId, updated.id, updated.group_id, totalAmount, updated.period);
      }

      return updated;
    });
  }

  async getPayrolls(tenantId: string, query?: any) {
    const where: any = { tenant_id: tenantId };
    
    if (query?.branch_id && query.branch_id !== 'all') {
      where.branch_id = query.branch_id;
    }

    // Arxivlash filtri - Qat'iy Boolean tekshiruv
    if (query?.is_archived === 'true') {
      where.is_archived = true;
    } else {
      where.is_archived = { not: true }; // ham false, ham null holatlarni qamrab oladi
    }

    // Search and secondary filters
    if (query?.search) {
      where.OR = [
        { teacher: { user: { first_name: { contains: query.search, mode: 'insensitive' } } } },
        { teacher: { user: { last_name: { contains: query.search, mode: 'insensitive' } } } },
        { staff: { user: { first_name: { contains: query.search, mode: 'insensitive' } } } },
        { staff: { user: { last_name: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    if (query?.period) {
      where.period = query.period;
    }

    if (query?.type && query.type !== 'all') {
      where.type = query.type;
    }

    if (query?.startDate || query?.endDate) {
      where.created_at = {};
      if (query.startDate) where.created_at.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    return this.prisma.payroll.findMany({
      where,
      include: { 
        teacher: { include: { user: true } }, 
        staff: { include: { user: true } },
        branch: true,
        cashbox: true
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async archivePayroll(tenantId: string, id: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.findUnique({
        where: { id, tenant_id: tenantId },
      });

      if (!payroll) throw new Error('Payroll not found');
      if (payroll.is_archived) return payroll;

      const updated = await tx.payroll.update({
        where: { id, tenant_id: tenantId },
        data: {
          is_archived: true,
          archive_reason: reason,
          archived_at: new Date(),
        },
      });

      // If it was already PAID, we should probably refund the cashbox?
      // Based on user "ruxsat beriladi" for minus balance, we just reverse the transaction.
      if (payroll.status === 'PAID' && payroll.cashbox_id) {
        const totalAmount = Number(payroll.amount) + Number(payroll.bonus) - Number(payroll.deduction);
        await tx.cashbox.update({
          where: { id: payroll.cashbox_id },
          data: { balance: { increment: totalAmount } }
        });
      }

      return updated;
    });
  }

  async restorePayroll(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.findUnique({
        where: { id, tenant_id: tenantId },
      });

      if (!payroll) throw new Error('Payroll not found');
      if (!payroll.is_archived) return payroll;

      const updated = await tx.payroll.update({
        where: { id, tenant_id: tenantId },
        data: {
          is_archived: false,
          archived_at: null,
        },
      });

      // If it was PAID, decrement cashbox again
      if (payroll.status === 'PAID' && payroll.cashbox_id) {
        const totalAmount = Number(payroll.amount) + Number(payroll.bonus) - Number(payroll.deduction);
        await tx.cashbox.update({
          where: { id: payroll.cashbox_id },
          data: { balance: { decrement: totalAmount } }
        });
      }

      return updated;
    });
  }

  async deletePayroll(tenantId: string, id: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id, tenant_id: tenantId },
    });
    
    if (!payroll) throw new Error('Payroll not found');
    
    // Agar arxiv sahifasidan kelayotgan bo'lsa yoki qat'iy is_archived bo'lmasa ham o'chirishga ruxsat beramiz
    // lekin xavfsizlik uchun tekshiruvni biroz yumshatamiz
    if (payroll.is_archived === false) {
      throw new Error('Faqat arxivlangan to\'lovlarni butunlay o\'chirish mumkin');
    }

    return this.prisma.payroll.delete({
      where: { id, tenant_id: tenantId },
    });
  }

  async getDiscounts(tenantId: string) {
    return this.prisma.discount.findMany({
      where: { tenant_id: tenantId },
    });
  }

  async archivePayment(tenantId: string, id: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get Payment
      const payment = await tx.payment.findUnique({
        where: { id, tenant_id: tenantId },
      });

      if (!payment) throw new Error('Payment not found');
      if (payment.is_archived) return payment;

      // 2. Update Payment
      const updated = await tx.payment.update({
        where: { id, tenant_id: tenantId },
        data: {
          is_archived: true,
          archive_reason: reason,
          archived_at: new Date(),
        },
      });

      // 3. Update Cashbox Balance (Decrement - Refund)
      if (payment.cashbox_id) {
        await tx.cashbox.update({
          where: { id: payment.cashbox_id },
          data: { balance: { decrement: payment.amount } },
        });
      }

      return updated;
    });
  }

  async restorePayment(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get Payment
      const payment = await tx.payment.findUnique({
        where: { id, tenant_id: tenantId },
      });

      if (!payment) throw new Error('Payment not found');
      if (!payment.is_archived) return payment;

      // 2. Update Payment
      const updated = await tx.payment.update({
        where: { id, tenant_id: tenantId },
        data: {
          is_archived: false,
          archived_at: null,
        },
      });

      // 3. Update Cashbox Balance (Increment)
      if (payment.cashbox_id) {
        await tx.cashbox.update({
          where: { id: payment.cashbox_id },
          data: { balance: { increment: payment.amount } },
        });
      }

      return updated;
    });
  }

  async deletePayment(tenantId: string, id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id, tenant_id: tenantId },
    });
    
    if (!payment) throw new Error('Payment not found');
    
    // Only allow deletion if archived
    if (!payment.is_archived) {
      throw new Error('Only archived payments can be permanently deleted');
    }

    return this.prisma.payment.delete({
      where: { id, tenant_id: tenantId },
    });
  }

  // --- BONUSES ---
  async getBonuses(tenantId: string, query?: any) {
    const where: any = { tenant_id: tenantId };
    
    if (query?.branch_id && query.branch_id !== 'all') {
      where.branch_id = query.branch_id;
    }

    // Archiving filter
    if (query?.is_archived === 'true') {
      where.is_archived = true;
    } else {
      where.is_archived = { not: true };
    }

    if (query?.search) {
      where.OR = [
        { teacher: { user: { first_name: { contains: query.search, mode: 'insensitive' } } } },
        { teacher: { user: { last_name: { contains: query.search, mode: 'insensitive' } } } },
        { staff: { user: { first_name: { contains: query.search, mode: 'insensitive' } } } },
        { staff: { user: { last_name: { contains: query.search, mode: 'insensitive' } } } },
        { reason: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query?.source_id && query.source_id !== 'all') {
      where.source_id = query.source_id;
    }

    if (query?.startDate || query?.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    return this.prisma.bonus.findMany({
      where,
      include: {
        teacher: { include: { user: true } },
        staff: { include: { user: true } },
        branch: true,
        cashbox: true,
        source: true
      },
      orderBy: { date: 'desc' }
    });
  }

  async createBonus(tenantId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Bonus
      const bonus = await tx.bonus.create({
        data: {
          tenant_id: tenantId,
          branch_id: data.branch_id,
          teacher_id: data.teacher_id,
          staff_id: data.staff_id,
          amount: data.amount,
          reason: data.reason,
          source_id: data.source_id,
          payment_method: data.payment_method || 'CASH',
          cashbox_id: data.cashbox_id,
          date: data.date ? new Date(data.date) : new Date(),
        }
      });

      // 2. Decrement Cashbox Balance (Bonus is an expense)
      if (data.cashbox_id) {
        await tx.cashbox.update({
          where: { id: data.cashbox_id },
          data: { balance: { decrement: data.amount } }
        });
      }

      return bonus;
    });
  }

  async archiveBonus(tenantId: string, id: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const bonus = await tx.bonus.findUnique({ where: { id, tenant_id: tenantId } });
      if (!bonus) throw new Error('Bonus not found');
      if (bonus.is_archived) return bonus;

      const updated = await tx.bonus.update({
        where: { id, tenant_id: tenantId },
        data: {
          is_archived: true,
          archive_reason: reason,
          archived_at: new Date()
        }
      });

      // Refund cashbox
      if (bonus.cashbox_id) {
        await tx.cashbox.update({
          where: { id: bonus.cashbox_id },
          data: { balance: { increment: bonus.amount } }
        });
      }

      return updated;
    });
  }

  async restoreBonus(tenantId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const bonus = await tx.bonus.findUnique({ where: { id, tenant_id: tenantId } });
      if (!bonus) throw new Error('Bonus not found');
      if (!bonus.is_archived) return bonus;

      const updated = await tx.bonus.update({
        where: { id, tenant_id: tenantId },
        data: {
          is_archived: false,
          archived_at: null
        }
      });

      // Decrement cashbox again
      if (bonus.cashbox_id) {
        await tx.cashbox.update({
          where: { id: bonus.cashbox_id },
          data: { balance: { decrement: bonus.amount } }
        });
      }

      return updated;
    });
  }

  async deleteBonus(tenantId: string, id: string) {
    const bonus = await this.prisma.bonus.findUnique({ where: { id, tenant_id: tenantId } });
    if (!bonus) throw new Error('Bonus not found');
    if (!bonus.is_archived) throw new Error('Faqat arxivlangan bonuslarni o\'chirish mumkin');

    return this.prisma.bonus.delete({ where: { id, tenant_id: tenantId } });
  }

  // --- BONUS SOURCES ---
  async getBonusSources(tenantId: string) {
    // Agar umuman manbalar yo'q bo'lsa, defaltlarini yaratib qo'yamiz (dinamik bo'lishi uchun)
    const count = await this.prisma.bonusSource.count({ where: { tenant_id: tenantId } });
    if (count === 0) {
      const defaults = ['KPI', 'Tashakkurnoma', 'Maxsus loyiha'];
      await this.prisma.bonusSource.createMany({
        data: defaults.map(name => ({ tenant_id: tenantId, name }))
      });
    }

    return this.prisma.bonusSource.findMany({
      where: { tenant_id: tenantId, is_active: true },
      orderBy: { name: 'asc' }
    });
  }

  async createBonusSource(tenantId: string, data: { name: string }) {
    return this.prisma.bonusSource.create({
      data: { tenant_id: tenantId, name: data.name }
    });
  }

  async deleteBonusSource(tenantId: string, id: string) {
    return this.prisma.bonusSource.update({
      where: { id, tenant_id: tenantId },
      data: { is_active: false }
    });
  }

  // --- CASHFLOW & TRANSFERS ---
  async getCashboxSummary(tenantId: string, branchId: string, query: any) {
    const startDate = query.startDate;
    const endDate = query.endDate;

    const where: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') {
      where.branch_id = branchId;
    }

    const cashboxes = await this.prisma.cashbox.findMany({ where });

    const stats: any = {
      cash_total: 0,
      other_total: 0,
      period_incomes: 0,
      period_expenses: 0,
      incomes: { CASH: 0, CARD: 0, TRANSFER: 0, TERMINAL: 0 },
      expenses: { CASH: 0, CARD: 0, TRANSFER: 0, TERMINAL: 0 },
      directions: []
    };

    cashboxes.forEach(cb => {
      const balance = Number(cb.balance || 0);
      const balanceOther = Number(cb.balance_other || 0);
      const type = cb.type || 'PHYSICAL'; 
      if (type === 'PHYSICAL') {
        stats.cash_total += balance;
        stats.other_total += balanceOther;
      } else {
        stats.other_total += balance + balanceOther;
      }
    });

    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setMonth(start.getMonth() - 1); // Default 1 month
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const periodWhere: any = { 
      tenant_id: tenantId, 
      created_at: { gte: start, lte: end },
      status: 'SUCCESS',
      is_archived: false
    };
    if (branchId && branchId !== 'all') {
      periodWhere.branch_id = branchId;
    }

    const directionMap: Record<string, number> = {};
    const salesWhere = { ...periodWhere };
    const adjustmentWhere: any = {
      tenant_id: tenantId,
      type: 'ADJUSTMENT',
      created_at: { gte: start, lte: end }
    };
    if (branchId && branchId !== 'all') adjustmentWhere.branch_id = branchId;
    

    // --- 1. Fetch Revenue Segments (Course Incomes) ---
    const revenueSegments = await this.prisma.revenueSegment.findMany({
      where: {
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        date: { gte: start, lte: end }
      },
      include: { group: { include: { course: true } }, payment: true }
    });

    // --- 2. Fetch Direct Payments (Mock Exams, Books, Other Incomes without segments) ---
    const directPayments = await this.prisma.payment.findMany({
      where: {
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        created_at: { gte: start, lte: end },
        status: 'SUCCESS',
        is_archived: false,
        revenueSegments: { none: {} } // Crucial: avoid double counting with segments
      },
      include: { category: true }
    });

    // Process Segments
    revenueSegments.forEach(rs => {
      const amt = Number(rs.amount || 0);
      stats.period_incomes += amt;
      const type = (rs.payment?.type || 'CASH') as keyof typeof stats.incomes;
      if (stats.incomes[type] !== undefined) stats.incomes[type] += amt;

      let dName = 'Kurs to\'lovlari';
      if (rs.group?.course?.name) {
        dName = rs.group.course.name;
      }
      directionMap[dName] = (directionMap[dName] || 0) + amt;
    });

    // Process Direct Payments
    directPayments.forEach(p => {
      const amt = Number(p.amount || 0);
      stats.period_incomes += amt;
      const type = (p.type || 'CASH') as keyof typeof stats.incomes;
      if (stats.incomes[type] !== undefined) stats.incomes[type] += amt;

      const dName = p.category?.name || p.description || 'Boshqa kirimlar';
      directionMap[dName] = (directionMap[dName] || 0) + amt;
    });

    // Process Sales & Adjustments
    const salesAndAdjs = await Promise.all([
       this.prisma.saleTransaction.findMany({ where: salesWhere, include: { items: { include: { product: { include: { category: true } } } } } }),
       this.prisma.cashflowTransfer.findMany({ where: adjustmentWhere })
    ]);

    salesAndAdjs[0].forEach(s => {
      const amt = Number(s.amount || 0);
      stats.period_incomes += amt;
      const type = (s.payment_method || 'CASH') as keyof typeof stats.incomes;
      if (stats.incomes[type] !== undefined) stats.incomes[type] += amt;
      const firstItem = s.items[0];
      const dName = firstItem?.product?.category?.name || firstItem?.product?.name || 'Magazin/Sotuv';
      directionMap[dName] = (directionMap[dName] || 0) + amt;
    });

    salesAndAdjs[1].forEach(adj => {
      const total = Number(adj.amount_cash || 0) + Number(adj.amount_other || 0);
      if (total > 0) {
        stats.period_incomes += total;
        const dName = adj.description ? `Tuzatish: ${adj.description}` : 'Kassa tuzatishlari';
        directionMap[dName] = (directionMap[dName] || 0) + total;
      }
    });

    stats.revenue_directions = Object.keys(directionMap)
      .map(name => ({ name, value: directionMap[name] }))
      .sort((a, b) => b.value - a.value);

    // --- 4. Fetch Expenses (General & Categorized) ---
    const expenseWhere: any = { 
      tenant_id: tenantId, 
      date: { gte: start, lte: end },
      is_archived: false
    };
    if (branchId && branchId !== 'all') expenseWhere.branch_id = branchId;

    const generalExpenses = await this.prisma.expense.findMany({
      where: expenseWhere,
      include: { categoryRel: true }
    });

    // --- 5. Fetch Payroll Segments ---
    const payrollSegments = await this.prisma.payrollSegment.findMany({
      where: {
        tenant_id: tenantId,
        branch_id: branchId && branchId !== 'all' ? branchId : undefined,
        date: { gte: start, lte: end }
      },
      include: { payroll: true }
    });

    const expMap: Record<string, number> = {};

    // Process General Expenses
    generalExpenses.forEach(ex => {
      const amt = Number(ex.amount || 0);
      stats.period_expenses += amt;
      const pm = (ex.payment_method || 'CASH') as keyof typeof stats.expenses;
      if (stats.expenses[pm] !== undefined) stats.expenses[pm] += amt;
      
      const catName = ex.categoryRel?.name || ex.category || 'Boshqa xarajatlar';
      expMap[catName] = (expMap[catName] || 0) + amt;
    });

    payrollSegments.forEach(ps => {
      const amt = Number(ps.amount || 0);
      stats.period_expenses += amt;
      const pm = (ps.payroll?.payment_method || 'CASH') as keyof typeof stats.expenses;
      if (stats.expenses[pm] !== undefined) stats.expenses[pm] += amt;
      expMap['Ish haqi'] = (expMap['Ish haqi'] || 0) + amt;
    });

    // --- 6. Fetch Bonuses & Adjustments ---
    const bonusWhere: any = {
      tenant_id: tenantId,
      date: { gte: start, lte: end },
      is_archived: false
    };
    if (branchId && branchId !== 'all') bonusWhere.branch_id = branchId;
    
    const [bonuses, adjustments] = await Promise.all([
      this.prisma.bonus.findMany({ where: bonusWhere }),
      this.prisma.cashflowTransfer.findMany({
        where: {
          tenant_id: tenantId,
          type: 'ADJUSTMENT',
          created_at: { gte: start, lte: end },
          ...(branchId && branchId !== 'all' ? { branch_id: branchId } : {})
        }
      })
    ]);

    // Group Bonuses
    bonuses.forEach(b => {
      const amt = Number(b.amount || 0);
      stats.period_expenses += amt;
      const pm = (b.payment_method || 'CASH') as keyof typeof stats.expenses;
      if (stats.expenses[pm] !== undefined) stats.expenses[pm] += amt;

      expMap['Bonuslar / KPI'] = (expMap['Bonuslar / KPI'] || 0) + amt;
    });

    // Process Negative Adjustments (Reduction of funds)
    adjustments.forEach(adj => {
      const total = Number(adj.amount_cash || 0) + Number(adj.amount_other || 0);
      if (total < 0) {
        const amt = Math.abs(total);
        stats.period_expenses += amt;
        const dName = adj.description ? `Tuzatish (Xarajat): ${adj.description}` : 'Kassa tuzatishlari (Chiqim)';
        expMap[dName] = (expMap[dName] || 0) + amt;
      }
    });

    stats.expense_directions = Object.keys(expMap)
      .map(name => ({ name, value: expMap[name] }))
      .sort((a, b) => b.value - a.value);

    // --- 7. Final Net Profit Calculation ---
    stats.net_profit = stats.period_incomes - stats.period_expenses;

    return stats;
  }

  async getTransfers(tenantId: string, branchId?: string, query?: any) {
    const where: any = { 
      tenant_id: tenantId,
      ...(branchId && branchId !== 'all' ? { branch_id: branchId } : {})
    };

    if (query?.startDate || query?.endDate) {
      where.created_at = {};
      if (query.startDate) where.created_at.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    if (query?.type && query.type !== 'all') {
      where.type = query.type;
    }

    const prisma = this.prisma as any;
    const model = prisma.cashflowTransfer || prisma.cashflow_transfer;
    
    if (!model) {
      console.error('CRITICAL: CashflowTransfer model not found in Prisma Client. Keys:', Object.keys(prisma));
      return [];
    }

    return model.findMany({
      where,
      include: { 
        source: true, 
        destination: true,
        creator: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async executeTransfer(tenantId: string, userId: string, data: any) {
    return this.prisma.$transaction(async (tx) => {
      const { source_id, destination_id, amount_cash, amount_other, type, description, branch_id } = data;

      // 1. Create Transfer Log
      const prisma = tx as any;
      const model = prisma.cashflowTransfer || prisma.cashflow_transfer;
      
      let transfer = null;
      if (model) {
        transfer = await model.create({
          data: {
            tenant_id: tenantId,
            branch_id: branch_id || null,
            source_id: source_id || null,
            destination_id: destination_id || null,
            amount_cash: Number(amount_cash || 0),
            amount_other: Number(amount_other || 0),
            type,
            description,
            created_by: userId
          }
        });
      } else {
        console.error('CRITICAL: CashflowTransfer model not found during transaction.');
      }

      // 2. Adjust Balances
      if (source_id) {
         await tx.cashbox.update({
           where: { id: source_id },
           data: {
             balance: { decrement: Number(amount_cash || 0) },
             balance_other: { decrement: Number(amount_other || 0) }
           }
         });
      }

      if (destination_id) {
        await tx.cashbox.update({
          where: { id: destination_id },
          data: {
            balance: { increment: Number(amount_cash || 0) },
            balance_other: { increment: Number(amount_other || 0) }
          }
        });
      }

      return transfer;
    });
  }

  async getCashflowGraphData(tenantId: string, branchId?: string, query?: any) {
    const { startDate, endDate } = query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setDate(end.getDate() - 7);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const baseWhere: any = {
      tenant_id: tenantId,
      ...(branchId && branchId !== 'all' ? { branch_id: branchId } : {})
    };

    // 1. Fetch ALL data in parallel for performance
    const [revenueSegments, sales, expenses, payrollSegments, bonuses, adjustments] = await Promise.all([
      this.prisma.revenueSegment.findMany({
        where: { ...baseWhere, date: { gte: start, lte: end } },
        select: { amount: true, date: true }
      }),
      this.prisma.saleTransaction.findMany({
        where: { ...baseWhere, is_archived: false, created_at: { gte: start, lte: end }, status: 'SUCCESS' },
        select: { amount: true, created_at: true }
      }),
      this.prisma.expense.findMany({
        where: { ...baseWhere, is_archived: false, date: { gte: start, lte: end } },
        select: { amount: true, date: true }
      }),
      this.prisma.payrollSegment.findMany({
        where: { ...baseWhere, date: { gte: start, lte: end } },
        select: { amount: true, date: true }
      }),
      this.prisma.bonus.findMany({
        where: { ...baseWhere, is_archived: false, date: { gte: start, lte: end } },
        select: { amount: true, date: true }
      }),
      this.prisma.cashflowTransfer.findMany({
        where: { 
          tenant_id: tenantId, 
          type: 'ADJUSTMENT', 
          created_at: { gte: start, lte: end },
          ...(branchId && branchId !== 'all' ? { branch_id: branchId } : {})
        },
        select: { amount_cash: true, amount_other: true, created_at: true }
      })
    ]);

    // 2. Group by date in JS
    const dateMap: Record<string, { kirim: number, chiqim: number }> = {};
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    revenueSegments.forEach(p => {
      const key = formatDate(p.date);
      if (!dateMap[key]) dateMap[key] = { kirim: 0, chiqim: 0 };
      dateMap[key].kirim += Number(p.amount || 0);
    });
    sales.forEach(s => {
      const key = formatDate(s.created_at);
      if (!dateMap[key]) dateMap[key] = { kirim: 0, chiqim: 0 };
      dateMap[key].kirim += Number(s.amount || 0);
    });
    expenses.forEach(e => {
      const key = formatDate(e.date);
      if (!dateMap[key]) dateMap[key] = { kirim: 0, chiqim: 0 };
      dateMap[key].chiqim += Number(e.amount || 0);
    });
    payrollSegments.forEach(p => {
      const key = formatDate(p.date);
      if (!dateMap[key]) dateMap[key] = { kirim: 0, chiqim: 0 };
      dateMap[key].chiqim += Number(p.amount || 0);
    });
    bonuses.forEach(b => {
      const key = formatDate(b.date);
      if (!dateMap[key]) dateMap[key] = { kirim: 0, chiqim: 0 };
      dateMap[key].chiqim += Number(b.amount || 0);
    });
    adjustments.forEach(adj => {
      const key = formatDate(adj.created_at);
      if (!dateMap[key]) dateMap[key] = { kirim: 0, chiqim: 0 };
      const total = Number(adj.amount_cash || 0) + Number(adj.amount_other || 0);
      if (total > 0) dateMap[key].kirim += total;
      else if (total < 0) dateMap[key].chiqim += Math.abs(total);
    });

    // 3. Generate daily array and fill gaps
    const result: any[] = [];
    const current = new Date(start);
    while (current <= end) {
      const key = formatDate(current);
      const data = dateMap[key] || { kirim: 0, chiqim: 0 };
      
      result.push({
        date: key,
        name: current.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
        kirim: data.kirim,
        chiqim: data.chiqim,
        net: data.kirim - data.chiqim
      });
      
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  async calculateAutomaticPayroll(tenantId: string, groupId: string, monthStr: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, tenant_id: tenantId },
      include: { 
        schedules: true,
        enrollments: { where: { status: 'ACTIVE' }, include: { student: true } }
      }
    });

    if (!group) throw new Error('Guruh topilmadi');

    // --- 1. Define Period ---
    const parts = monthStr.split(' ');
    const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    const monthIndex = monthNames.indexOf(parts[0]);
    const year = parseInt(parts[1]) || new Date().getFullYear();
    
    if (monthIndex === -1) throw new Error('Yaroqsiz oy formati');

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);

    // --- 2. Calculate Sessions ---
    const scheduleDays = group.schedules.map(s => s.day_of_week);
    const totalSessions = this.countSessionsAcrossPeriod(startDate, endDate, scheduleDays);

    if (totalSessions === 0) return { mainTeacherAmount: 0, supportTeacherAmount: 0, totalRevenue: 0 };

    // --- 3. Calculate Revenue based on Invoices (Pro-rata) ---
    const invoices = await this.prisma.invoice.findMany({
      where: {
        group_id: groupId,
        month: { contains: monthStr },
        type: 'COURSE'
      }
    });

    const invoicedRevenue = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    
    const activeEnrollments = group.enrollments;
    const vipStudents = activeEnrollments.filter(e => e.student.is_vip);
    
    const basePrice = Number(group.price) || 0;
    // VIP o'quvchilar uchun ustozga to'liq summa bo'yicha ulush beriladi (Virtual revenue)
    const vipShadowRevenue = vipStudents.length * basePrice;

    const shadowRevenue = invoicedRevenue + vipShadowRevenue;

    // --- 4. Calculate Salaries ---
    let mainTeacherAmount = 0;
    let supportTeacherAmount = 0;

    if (group.is_vip) {
      mainTeacherAmount = Number(group.teacher_salary_value) || 0;
      supportTeacherAmount = Number(group.support_salary_value) || 0;
    } else {
      const calculateAmount = (type: string, value: number, base: number) => {
        if (type === 'PERCENT_REVENUE') return (base * value) / 100;
        if (type === 'FIXED') return value;
        return 0;
      };

      const totalMainPot = calculateAmount(group.teacher_salary_type, Number(group.teacher_salary_value), shadowRevenue);
      const totalDaysPerWeek = (Number(group.main_teacher_days) || 0) + (group.support_teacher_id ? (Number(group.support_teacher_days) || 0) : 0);
      
      if (totalDaysPerWeek > 0) {
         mainTeacherAmount = (totalMainPot * (Number(group.main_teacher_days) || 0)) / totalDaysPerWeek;
      } else {
         mainTeacherAmount = totalMainPot;
      }

      if (group.support_teacher_id) {
        // Support teacher might have its own type or share the logic
        const supportSalaryType = group.support_salary_type || 'FIXED';
        const supportSalaryValue = Number(group.support_salary_value) || 0;
        
        const totalSupportPot = calculateAmount(supportSalaryType, supportSalaryValue, shadowRevenue);
        if (totalDaysPerWeek > 0 && supportSalaryType === 'PERCENT_REVENUE') {
           supportTeacherAmount = (totalSupportPot * (Number(group.support_teacher_days) || 0)) / totalDaysPerWeek;
        } else {
           supportTeacherAmount = totalSupportPot;
        }
      }
    }

    const totalPenalties = await this.prisma.penalty.aggregate({
      where: {
        teacher_id: group.teacher_id as string,
        tenant_id: tenantId,
        date: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true }
    });

    return {
      mainTeacherId: group.teacher_id,
      supportTeacherId: group.support_teacher_id,
      mainTeacherAmount: Math.round(mainTeacherAmount),
      supportTeacherAmount: Math.round(supportTeacherAmount),
      totalPenalties: Number(totalPenalties._sum.amount || 0),
      totalRevenue: shadowRevenue,
      sessions: totalSessions,
      period: monthStr
    };
  }

  private async createRevenueSegments(tx: any, tenantId: string, paymentId: string, groupId: string, amount: number, startDate: Date, endDate: Date) {
    const group = await tx.group.findUnique({
      where: { id: groupId },
      include: { schedules: true }
    });
    if (!group || group.schedules.length === 0) {
      await tx.revenueSegment.create({
        data: {
          tenant_id: tenantId,
          payment_id: paymentId,
          amount: amount,
          date: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
          group_id: groupId,
          type: 'COURSE'
        }
      });
      return;
    }

    const scheduleDays = group.schedules.map((s: any) => s.day_of_week);
    const totalLessons = this.countSessionsAcrossPeriod(startDate, endDate, scheduleDays);
    
    if (totalLessons === 0) {
      await tx.revenueSegment.create({
        data: {
          tenant_id: tenantId,
          payment_id: paymentId,
          amount: amount,
          date: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
          group_id: groupId,
          type: 'COURSE'
        }
      });
      return;
    }

    const monthlyLessons: Record<string, number> = {};
    let current = new Date(startDate);
    while (current <= endDate) {
      if (scheduleDays.includes(current.getDay())) {
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        monthlyLessons[key] = (monthlyLessons[key] || 0) + 1;
      }
      current.setDate(current.getDate() + 1);
    }

    for (const [monthKey, lessons] of Object.entries(monthlyLessons)) {
      const [year, month] = monthKey.split('-').map(Number);
      const segmentAmount = (amount / totalLessons) * lessons;
      
      await tx.revenueSegment.create({
        data: {
          tenant_id: tenantId,
          branch_id: group.branch_id,
          payment_id: paymentId,
          amount: Math.round(segmentAmount),
          date: new Date(year, month - 1, 1),
          group_id: groupId,
          type: 'COURSE'
        }
      });
    }
  }

  private async createPayrollSegments(tx: any, tenantId: string, payrollId: string, groupId: string, amount: number, period: string) {
     const group = await tx.group.findUnique({
       where: { id: groupId },
       include: { schedules: true }
     });
     if (!group || group.schedules.length === 0) {
        await tx.payrollSegment.create({
          data: { tenant_id: tenantId, payroll_id: payrollId, amount: amount, date: new Date() }
        });
        return;
     }

     // Perioddan sanalarni chiqarish
     const parts = period.split(' ');
     const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
     const monthIndex = monthNames.indexOf(parts[0]);
     const year = parseInt(parts[1]) || new Date().getFullYear();
     
     if (monthIndex === -1) {
        await tx.payrollSegment.create({
          data: { tenant_id: tenantId, payroll_id: payrollId, amount: amount, date: new Date() }
        });
        return;
     }

     const startDate = new Date(year, monthIndex, 1);
     const endDate = new Date(year, monthIndex + 1, 0);

     const scheduleDays = group.schedules.map((s: any) => s.day_of_week);
     const totalLessons = this.countSessionsAcrossPeriod(startDate, endDate, scheduleDays);

     if (totalLessons === 0) {
        await tx.payrollSegment.create({
          data: { tenant_id: tenantId, payroll_id: payrollId, amount, date: startDate }
        });
        return;
     }

     // Oylar bo'yicha bo'lish (odatda oylik 1 oy uchun, lekin stage spanning bo'lishi mumkin)
     // Lekin Payroll hozircha 1 kalendar oy uchun hisoblanyapti calculateAutomaticPayroll da.
     // Shuning uchun bu yerda hozircha 1 ta segment bo'ladi, agar kelajakda payroll davri o'zgarsa mantiq tayyor.
     await tx.payrollSegment.create({
        data: {
          tenant_id: tenantId,
          branch_id: group.branch_id,
          payroll_id: payrollId,
          amount: amount,
          date: startDate
        }
     });
  }

  private countSessionsAcrossPeriod(startDate: Date, endDate: Date, scheduleDays: number[]): number {
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
  async getArchiveStats(tenantId: string, branchId?: string) {
    const where: any = { tenant_id: tenantId, is_archived: true };
    if (branchId && branchId !== 'all') where.branch_id = branchId;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalArchivePayments, 
      totalArchiveExpenses, 
      totalArchiveSales, 
      totalArchivePayrolls, 
      totalArchiveBonuses,
      recentPayments,
      recentExpenses,
      recentSales,
      recentPayrolls,
      recentBonuses
    ] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.expense.count({ where }),
      this.prisma.saleTransaction.count({ where }),
      this.prisma.payroll.count({ where }),
      this.prisma.bonus.count({ where }),
      this.prisma.payment.count({ where: { ...where, archived_at: { gte: sevenDaysAgo } } }),
      this.prisma.expense.count({ where: { ...where, archived_at: { gte: sevenDaysAgo } } }),
      this.prisma.saleTransaction.count({ where: { ...where, archived_at: { gte: sevenDaysAgo } } }),
      this.prisma.payroll.count({ where: { ...where, archived_at: { gte: sevenDaysAgo } } }),
      this.prisma.bonus.count({ where: { ...where, archived_at: { gte: sevenDaysAgo } } }),
    ]);

    const totalArchive = totalArchivePayments + totalArchiveExpenses + totalArchiveSales + totalArchivePayrolls + totalArchiveBonuses;
    const recent = recentPayments + recentExpenses + recentSales + recentPayrolls + recentBonuses;

    return {
      totalArchive,
      recent,
      older: totalArchive - recent
    };
  }
}
