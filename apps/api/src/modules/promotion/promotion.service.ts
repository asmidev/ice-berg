import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PromotionService {
  constructor(private prisma: PrismaService) {}

  async createPromotion(tenantId: string, data: any) {
    try {
      return await this.prisma.promotion.create({
        data: {
          tenant_id: tenantId,
          branch_id: data.branch_id || null,
          name: data.name,
          date: data.date ? new Date(data.date) : new Date(),
          manager_id: data.manager_id,
          classes: {
            create: (data.classes || []).map((c: any) => ({
              name: c.name,
              notes: c.notes,
              count: c.count,
            })),
          },
        },
        include: { classes: true },
      });
    } catch (err: any) {
      console.error("PROMOTION CREATE ERROR", err);
      throw new HttpException(err.message || 'Targ\'ibot tadbirini yaratishda xatolik', 400);
    }
  }

  async getPromotions(tenantId: string, branchId?: string, query?: any) {
    try {
      const where: any = { tenant_id: tenantId };
      if (branchId && branchId !== 'all') where.branch_id = branchId;
      
      if (query?.search) {
        where.name = { contains: query.search, mode: 'insensitive' };
      }

      return await this.prisma.promotion.findMany({
        where,
        include: {
          classes: true,
          manager: { select: { first_name: true, last_name: true } },
          _count: { select: { leads: true } },
        },
        orderBy: { date: 'desc' },
      });
    } catch (err: any) {
      console.error("GET PROMOTIONS ERROR", err);
      throw new HttpException(err.message || 'Targ\'ibotlar ro\'yxatini olishda xatolik', 400);
    }
  }

  async getPromotionById(tenantId: string, id: string) {
    try {
      const promotion = await this.prisma.promotion.findFirst({
        where: { id, tenant_id: tenantId },
        include: {
          classes: true,
          manager: { select: { first_name: true, last_name: true } },
          leads: {
            include: { stage: true, source: true }
          }
        },
      });
      if (!promotion) throw new HttpException('Targ\'ibot tadbiri topilmadi', 404);
      return promotion;
    } catch (err: any) {
      throw new HttpException(err.message || 'Xatolik', 400);
    }
  }

  async updatePromotionClass(tenantId: string, classId: string, data: any) {
    try {
      return await this.prisma.promotionClass.update({
        where: { id: classId },
        data: {
          name: data.name,
          notes: data.notes,
          count: data.count,
        },
      });
    } catch (err: any) {
      throw new HttpException(err.message || 'Sinf ma\'lumotlarini tahrirlashda xatolik', 400);
    }
  }

  async addLeadsToPromotion(tenantId: string, promotionId: string, leadData: any[]) {
    try {
      // Bu yerda bir vaqtning o'zida ham lid yaratib, ham promotion-ga bog'laymiz
      return await this.prisma.$transaction(async (tx) => {
        const results = [];
        for (const ld of leadData) {
          const lead = await tx.lead.create({
            data: {
              tenant_id: tenantId,
              branch_id: ld.branch_id,
              name: ld.name,
              phone: ld.phone,
              promotion_id: promotionId,
              source_id: ld.source_id,
              notes: ld.notes,
              manager_id: ld.manager_id,
            }
          });
          results.push(lead);
        }
        return results;
      });
    } catch (err: any) {
      throw new HttpException(err.message || 'Lidlarni qo\'shishda xatolik', 400);
    }
  }
}
