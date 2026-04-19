import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SmsService implements OnModuleInit {
  private readonly logger = new Logger(SmsService.name);
  private eskizToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.getToken(true).catch(err => this.logger.error('Initial Eskiz token fetch failed', err));
  }

  // --- ESKIZ AUTHENTICATION ---
  private async getToken(isInit = false): Promise<string | null> {
    const now = Date.now();
    if (this.eskizToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.eskizToken;
    }

    // Try to get from database first
    const tenant = await this.prisma.tenant.findFirst();
    let email = (tenant?.settings as any)?.sms?.email;
    let password = (tenant?.settings as any)?.sms?.password;

    // Fallback to environment variables
    if (!email || !password) {
      email = process.env.ESKIZ_EMAIL;
      password = process.env.ESKIZ_PASSWORD;
    }

    if (!email || !password) {
      if (!isInit) {
        this.logger.error('ESKIZ credentials not set (DB or ENV)');
      }
      return null;
    }

    try {
      const response = await fetch('https://notify.eskiz.uz/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result: any = await response.json();
      if (result?.data?.token) {
        this.eskizToken = result.data.token;
        this.tokenExpiry = now + 23 * 60 * 60 * 1000; 
        return this.eskizToken;
      }
    } catch (err) {
      this.logger.error('Failed to get Eskiz token', err);
    }
    return null;
  }

  // --- CORE SMS SENDING ---
  async sendSms(tenantId: string, branchId: string | null, phone: string, message: string) {
    const token = await this.getToken();
    let status = 'FAILED';

    if (token) {
       try {
         // Eskiz expects phone without +
         const cleanPhone = phone.replace(/\D/g, '');
          const tenant = await this.prisma.tenant.findFirst();
          const sender = (tenant?.settings as any)?.sms?.from || process.env.ESKIZ_SENDER || '4546';

          const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              mobile_phone: cleanPhone,
              message: message,
              from: sender
            })
          });

         const result: any = await response.json();
         if (result?.status === 'waiting' || result?.status === 'success') {
           status = 'SENT';
           this.logger.log(`SMS sent to ${phone}: ${message}`);
         } else {
           this.logger.error(`Eskiz send failed for ${phone}: ${JSON.stringify(result)}`);
         }
       } catch (err) {
         this.logger.error(`SMS error for ${phone}`, err);
       }
    } else {
      this.logger.warn(`No Eskiz token - SMS logged but not sent to ${phone}`);
    }

    // Save to log
    return this.prisma.smsLog.create({
      data: {
        tenant_id: tenantId,
        branch_id: branchId,
        phone,
        message,
        status
      }
    });
  }

  // --- TEMPLATE RENDERING ---
  async renderTemplate(templateText: string, data: any) {
    let rendered = templateText;
    const mappings = {
      '(STUDENT)': data.studentName || '',
      '(BALANCE)': data.balance?.toLocaleString() || '0',
      '(GROUP)': data.groupName || '',
      '(TEACHER)': data.teacherName || '',
      '(LC)': data.lcName || 'ICE-BERG',
      '(BRANCH)': data.branchName || '',
      '(COURSE)': data.courseName || '',
      '(SUM)': data.amount?.toLocaleString() || '0',
      '(DATE)': new Date().toLocaleDateString()
    };

    Object.entries(mappings).forEach(([key, value]) => {
      rendered = rendered.split(key).join(String(value));
    });

    return rendered;
  }

  // --- SAFE BULK SENDING (Batching with delays) ---
  async sendBulkSms(tenantId: string, branchId: string | null, recipients: { phone: string, data: any }[], templateText: string) {
    const BATCH_SIZE = 5;
    const DELAY_MS = 1000; // 1 second pause between batches
    let totalSent = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (r) => {
        const message = await this.renderTemplate(templateText, r.data);
        await this.sendSms(tenantId, branchId, r.phone, message);
        totalSent++;
      }));

      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    return { totalSent };
  }

  // --- TRIGGER BASED SENDING ---
  async handleTrigger(tenantId: string, branchId: string | null, type: 'PAYMENT' | 'ENROLLMENT', data: any, phone: string) {
    const config = await this.prisma.autoSmsConfig.findFirst({
      where: {
        tenant_id: tenantId,
        branch_id: branchId,
        type: type,
        is_enabled: true
      },
      include: { template: true }
    });

    if (!config || !config.template) return null;

    const message = await this.renderTemplate(config.template.text, data);
    return this.sendSms(tenantId, branchId, phone, message);
  }

  // --- BULK SEND TO DEBTORS (Admin Triggered) ---
  async sendToDebtors(tenantId: string, branchId: string | null) {
     const config = await this.prisma.autoSmsConfig.findFirst({
        where: { 
          tenant_id: tenantId, 
          branch_id: (branchId === 'all' || !branchId) ? null : branchId,
          type: 'DEBTOR',
          is_enabled: true 
        },
        include: { template: true }
     });

     if (!config || !config.template) {
       return { success: false, message: 'Active SMS configuration or template not found for this branch' };
     }

     const debtors = await this.prisma.student.findMany({
       where: {
         tenant_id: tenantId,
         branch_id: (branchId === 'all' || !branchId) ? undefined : branchId,
         balance: { lt: 0 },
         is_archived: false
       },
       include: { user: true, enrollments: { include: { group: true } } }
     });

     const recipients = debtors
       .filter(s => s.user.phone)
       .map(s => ({
          phone: s.user.phone,
          data: {
            studentName: `${s.user.first_name} ${s.user.last_name}`,
            balance: Math.abs(Number(s.balance)),
            groupName: s.enrollments[0]?.group?.name || ''
          }
       }));

     const result = await this.sendBulkSms(tenantId, branchId, recipients, config.template.text);
     return { success: true, count: result.totalSent };
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async processAutoSms() {
    this.logger.log('Starting Scheduled SMS Processor...');
    const today = new Date().getDate();
    const nowTime = new Date().getHours() + ':' + new Date().getMinutes().toString().padStart(2, '0');

    const configs = await this.prisma.autoSmsConfig.findMany({
      where: {
        is_enabled: true,
        type: 'DEBTOR',
        scheduled_day: today
        // Note: For more precision, we'd check scheduled_time here
        // but for now we run it once a day at 10AM as per cron
      },
      include: { template: true, branch: true }
    });

    for (const config of configs) {
       await this.sendToDebtors(config.tenant_id, config.branch_id);
    }
  }

  // --- CRUD METHODS ---
  async getTemplates(tenantId: string, branchId?: string) {
    return this.prisma.smsTemplate.findMany({ 
      where: { 
        tenant_id: tenantId,
        ...(branchId && branchId !== 'all' ? { branch_id: branchId } : {})
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async createTemplate(tenantId: string, data: any) {
    const bId = (data.branch_id === 'all' || !data.branch_id) ? null : data.branch_id;
    return this.prisma.smsTemplate.create({
      data: { 
        name: data.name,
        text: data.text,
        is_active: data.is_active !== undefined ? data.is_active : true,
        tenant_id: tenantId,
        branch_id: bId
      }
    });
  }

  async updateTemplate(tenantId: string, id: string, data: any) {
    const bId = (data.branch_id === 'all' || !data.branch_id) ? null : data.branch_id;
    return this.prisma.smsTemplate.update({
      where: { id, tenant_id: tenantId },
      data: {
        name: data.name,
        text: data.text,
        is_active: data.is_active,
        branch_id: bId
      }
    });
  }

  async deleteTemplate(tenantId: string, id: string) {
    return this.prisma.smsTemplate.delete({ where: { id, tenant_id: tenantId } });
  }

  async getAutoConfigs(tenantId: string, branchId?: string) {
    return this.prisma.autoSmsConfig.findMany({
      where: { 
        tenant_id: tenantId,
        ...(branchId && branchId !== 'all' ? { branch_id: branchId } : {})
      },
      include: { template: true, branch: true }
    });
  }

  async upsertAutoConfig(tenantId: string, data: any) {
    const bId = (data.branch_id === 'all' || !data.branch_id) ? null : data.branch_id;
    const type = data.type || 'DEBTOR';

    // If there's an existing config with the SAME type and branch, we update it
    const existing = await this.prisma.autoSmsConfig.findFirst({
        where: { tenant_id: tenantId, branch_id: bId, type: type }
    });

    if (existing || data.id) {
       return this.prisma.autoSmsConfig.update({
         where: { id: data.id || existing.id, tenant_id: tenantId },
         data: {
           template_id: data.template_id,
           scheduled_day: Number(data.scheduled_day || 1),
           scheduled_time: data.scheduled_time || '10:00',
           is_enabled: data.is_enabled,
           branch_id: bId,
           type: type
         }
       });
    }
    
    return this.prisma.autoSmsConfig.create({
      data: {
        tenant_id: tenantId,
        branch_id: bId,
        template_id: data.template_id,
        scheduled_day: Number(data.scheduled_day || 1),
        scheduled_time: data.scheduled_time || '10:00',
        is_enabled: data.is_enabled,
        type: type
      }
    });
  }

  // --- REPORTING METHODS ---

  async getBalance() {
    const token = await this.getToken();
    if (!token) return null;

    try {
      const response = await fetch('https://notify.eskiz.uz/api/auth/user', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result: any = await response.json();
      // Eskiz returns balance in result.data.balance (usually in UZS or units)
      return result?.data?.balance || 0;
    } catch (err) {
      this.logger.error('Failed to get Eskiz balance', err);
      return null;
    }
  }

  async getReportStats(tenantId: string, branchId?: string, startDate?: string, endDate?: string) {
    const where: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') where.branch_id = branchId;
    if (startDate || endDate) {
      where.sent_at = {};
      if (startDate) where.sent_at.gte = new Date(startDate);
      if (endDate) where.sent_at.lte = new Date(endDate);
    }

    const [total, sent, failed, balance] = await Promise.all([
      this.prisma.smsLog.count({ where }),
      this.prisma.smsLog.count({ where: { ...where, status: 'SENT' } }),
      this.prisma.smsLog.count({ where: { ...where, status: 'FAILED' } }),
      this.getBalance()
    ]);

    return {
      total,
      sent,
      failed,
      balance: balance || 0
    };
  }

  async getReportLogs(tenantId: string, branchId?: string, status?: string, page = 1, limit = 20) {
    const where: any = { tenant_id: tenantId };
    if (branchId && branchId !== 'all') where.branch_id = branchId;
    if (status && status !== 'ALL') where.status = status;

    const [logs, total] = await Promise.all([
      this.prisma.smsLog.findMany({
        where,
        orderBy: { sent_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { branch: true }
      }),
      this.prisma.smsLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTrafficChart(tenantId: string, branchId?: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const where: any = { 
      tenant_id: tenantId,
      sent_at: { gte: sevenDaysAgo }
    };
    if (branchId && branchId !== 'all') where.branch_id = branchId;

    const logs = await this.prisma.smsLog.findMany({
      where,
      select: { sent_at: true, status: true }
    });

    // Group by day
    const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dayLogs = logs.filter(l => new Date(l.sent_at).toDateString() === date.toDateString());
      
      chartData.push({
        day: dayName,
        sent: dayLogs.filter(l => l.status === 'SENT').length,
        failed: dayLogs.filter(l => l.status === 'FAILED').length
      });
    }

    return chartData;
  }
}
