import { Injectable, HttpException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async createLead(tenantId: string, data: any) {
    try {
      let stageId = data.stageId || data.stage_id;
      if (!stageId) {
        const defaultStage = await this.prisma.leadStage.findFirst({
          where: { tenant_id: tenantId },
          orderBy: { order: 'asc' }
        });
        stageId = defaultStage?.id;
      }

      const branchId = data.branchId || data.branch_id || null;
      const sourceId = data.sourceId || data.source_id || null;
      const managerId = data.managerId || data.manager_id || null;
      const courseId = data.courseId || data.course_id || null;
      const promotionId = data.promotionId || data.promotion_id || null;

      return await this.prisma.lead.create({
        data: {
          tenant_id: tenantId,
          branch_id: branchId === 'all' ? null : branchId,
          name: data.name,
          phone: data.phone,
          source_id: sourceId,
          stage_id: stageId,
          manager_id: managerId,
          notes: data.notes,
          course_id: courseId,
          promotion_id: promotionId,
        },
      });
    } catch (err: any) {
      console.error("CRM CREATE ERROR", err);
      throw new HttpException(err.message || 'Lid yaratishda xatolik', 400);
    }
  }

  async bulkCreateLeads(tenantId: string, payload: { branchId: string, leads: any[] }) {
    try {
      const { branchId, leads: leadsData } = payload;
      
      const defaultStage = await this.prisma.leadStage.findFirst({
        where: { tenant_id: tenantId },
        orderBy: { order: 'asc' }
      });

      const results = {
        success: 0,
        errors: [] as string[]
      };

      await this.prisma.$transaction(async (prisma) => {
        for (const data of leadsData) {
          try {
            const name = data['Ism'] || data['name'] || 'Noma\'lum';
            const phone = String(data['Telefon'] || data['phone'] || '').replace(/\s/g, '');
            
            if (!phone) {
              results.errors.push(`Qatorda telefon raqami yo'q: ${name}`);
              continue;
            }

            await prisma.lead.create({
              data: {
                tenant_id: tenantId,
                branch_id: branchId === 'all' ? null : branchId,
                name,
                phone,
                notes: data['Izoh'] || data['notes'] || '',
                stage_id: defaultStage?.id,
                status: 'ACTIVE',
              },
            });
            results.success++;
          } catch (e: any) {
            results.errors.push(`Xatolik: ${e.message}`);
          }
        }
      });

      return results;
    } catch (err: any) {
      console.error("CRM BULK CREATE ERROR", err);
      throw new HttpException(err.message || 'Ommaviy yaratishda xatolik', 500);
    }
  }

  async getStages(tenantId: string) {
    try {
      const stages = await this.prisma.leadStage.findMany({
        where: { tenant_id: tenantId },
        orderBy: { order: 'asc' }
      });

      if (stages.length > 0 && !stages.some(s => s.name.toLowerCase().includes('aylangan'))) {
        const lastOrder = stages[stages.length - 1].order;
        await this.prisma.leadStage.create({
          data: {
            tenant_id: tenantId,
            name: "O'quvchiga aylangan",
            order: lastOrder + 1,
            color: 'emerald'
          }
        });
        return this.prisma.leadStage.findMany({
          where: { tenant_id: tenantId },
          orderBy: { order: 'asc' }
        });
      }

      return stages;
    } catch (e: any) {
      console.error("GET STAGES ERROR", e);
      throw e;
    }
  }

  async getSources(tenantId: string) {
    try {
      const allSources = await this.prisma.leadSource.findMany({
        where: { tenant_id: tenantId },
        orderBy: { name: 'asc' }
      });
      
      // Unikal nomlar bo'yicha filtrlaymiz (Banner Banner kabi holatlarni yo'qotish uchun)
      return allSources.filter((source, index, self) =>
        index === self.findIndex((s) => s.name === source.name)
      );
    } catch (e: any) {
      console.error("GET SOURCES ERROR", e);
      throw e;
    }
  }

  async createSource(tenantId: string, name: string) {
    try {
      if (!name?.trim()) throw new HttpException("Manba nomi bo'sh bo'lishi mumkin emas", 400);
      return await this.prisma.leadSource.create({
        data: { tenant_id: tenantId, name: name.trim() }
      });
    } catch (e: any) {
      console.error("CREATE SOURCE ERROR", e);
      throw e;
    }
  }

  async getLeads(tenantId: string, query: any) {
    const where: any = { tenant_id: tenantId };
    
    if (query.status) {
      where.status = query.status;
    } else {
      // Kanban board uchun ham ACTIVE, ham yaqinda CONVERTED bo'lganlarni (O'quvchiga aylangan bosqichidagilar) ko'rsatamiz
      where.OR = [
        { status: 'ACTIVE' },
        { 
          status: 'CONVERTED',
          stage: { name: { contains: 'aylangan', mode: 'insensitive' } }
        }
      ];
    }

    if (query.stage_id) where.stage_id = query.stage_id;
    if (query.source_id) where.source_id = query.source_id;
    if (query.manager_id) where.manager_id = query.manager_id;
    if (query.branch_id && query.branch_id !== 'all') where.branch_id = query.branch_id;
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } }
      ];
    }
    
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        orderBy: { created_at: 'desc' },
        include: { 
          manager: { select: { id: true, first_name: true, last_name: true, phone: true } },
          stage: true,
          source: true,
          branch: { select: { id: true, name: true } },
          course: { select: { id: true, name: true } },
          promotion: { select: { id: true, name: true } }
        },
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

  async updateStage(tenantId: string, leadId: string, stageId: string) {
    try {
      const stage = await this.prisma.leadStage.findUnique({ where: { id: stageId } });
      const isConvertedStage = stage?.name.toLowerCase().includes('aylangan');

      return await this.prisma.lead.update({
        where: { id: leadId, tenant_id: tenantId },
        data: { 
          stage_id: stageId,
          ...(isConvertedStage ? { 
            status: 'CONVERTED', 
            converted_at: new Date() 
          } : {
            status: 'ACTIVE'
          })
        },
      });
    } catch (e: any) {
      console.error("UPDATE STAGE ERROR", e);
      throw e;
    }
  }

  async convertToStudent(tenantId: string, leadId: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const lead = await prisma.lead.findUnique({
          where: { id: leadId, tenant_id: tenantId },
        });
        if (!lead) throw new NotFoundException('Lid topilmadi');

        let studentRole = await prisma.role.findUnique({ where: { slug: 'student' } });
        if (!studentRole) {
          studentRole = await prisma.role.create({
            data: { name: 'Talaba', slug: 'student', permissions: ['PROFILE'] }
          });
        }

        const user = await prisma.user.create({
          data: {
            tenant_id: tenantId,
            phone: lead.phone,
            first_name: lead.name,
            password_hash: await require('bcrypt').hash('student1', 10),
            role_id: studentRole.id,
          },
        });

        const student = await prisma.student.create({
          data: {
            tenant_id: tenantId,
            user_id: user.id,
            branch_id: lead.branch_id,
            status: 'ACTIVE',
          },
        });

        // Update lead stage to 'Enrolled' (Converted) if it exists
        const convertedStage = await prisma.leadStage.findFirst({
          where: { tenant_id: tenantId, name: { contains: 'olagan', mode: 'insensitive' } }
        });

        await prisma.lead.update({
          where: { id: lead.id },
          data: { stage_id: convertedStage?.id || lead.stage_id },
        });

        return student;
      });
    } catch (e: any) {
      console.error("CONVERT TO STUDENT ERROR", e);
      throw e;
    }
  }

  async archiveLead(tenantId: string, leadId: string, reason: string) {
    try {
      return await this.prisma.lead.update({
        where: { id: leadId, tenant_id: tenantId },
        data: { status: 'ARCHIVED', archive_reason: reason },
      });
    } catch (e: any) {
      console.error("ARCHIVE LEAD ERROR", e);
      throw e;
    }
  }

  async restoreLead(tenantId: string, leadId: string) {
    try {
      return await this.prisma.lead.update({
        where: { id: leadId, tenant_id: tenantId },
        data: { status: 'ACTIVE', archive_reason: null },
      });
    } catch (e: any) {
      console.error("RESTORE LEAD ERROR", e);
      throw e;
    }
  }

  async getArchiveReasons(tenantId: string) {
    try {
      const reasons = await this.prisma.archiveReason.findMany({
        where: { tenant_id: tenantId },
        orderBy: { created_at: 'asc' }
      });

      if (reasons.length === 0) {
        // Seed default reasons if empty
        const defaultReasons = ["Raqam xato", "Qiziqishi yo'q / Atkaz", "Narx qimmatlik qildi", "Raqobatchiga ketdi", "Keyingi faslda / yilda o'qiydi", "Boshqa"];
        await this.prisma.archiveReason.createMany({
          data: defaultReasons.map(name => ({ tenant_id: tenantId, name }))
        });
        return this.prisma.archiveReason.findMany({
          where: { tenant_id: tenantId },
          orderBy: { created_at: 'asc' }
        });
      }

      return reasons;
    } catch (e: any) {
      console.error("GET ARCHIVE REASONS ERROR", e);
      throw e;
    }
  }

  async createArchiveReason(tenantId: string, name: string) {
    try {
      if (!name?.trim()) throw new HttpException("Sabab nomi bo'sh bo'lishi mumkin emas", 400);
      return await this.prisma.archiveReason.create({
        data: { tenant_id: tenantId, name: name.trim() }
      });
    } catch (e: any) {
      console.error("CREATE ARCHIVE REASON ERROR", e);
      throw e;
    }
  }

  async getArchiveStats(tenantId: string, branchId?: string) {
    try {
      const where: any = { tenant_id: tenantId, status: 'ARCHIVED' };
      if (branchId && branchId !== 'all') where.branch_id = branchId;

      const [totalArchive, recent] = await Promise.all([
        this.prisma.lead.count({ where }),
        this.prisma.lead.count({
          where: {
            ...where,
            created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        })
      ]);

      return { totalArchive, recent, older: totalArchive - recent };
    } catch (e: any) {
      console.error("GET ARCHIVE STATS ERROR", e);
      throw e;
    }
  }
}
