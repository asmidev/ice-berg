import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(tenantId: string, branchId?: string) {
    const now = new Date();
    const studentDiscounts = await this.prisma.studentDiscount.findMany({
      where: {
        student: {
          is: {
            tenant_id: tenantId,
            branch_id: branchId && branchId !== 'all' ? branchId : undefined,
            status: 'ACTIVE',
            is_archived: false,
          }
        },
        OR: [
          { expires_at: null },
          { expires_at: { gt: now } }
        ]
      },
      include: {
        discount: true,
        student: {
          include: {
            enrollments: {
              where: { status: 'ACTIVE' },
              include: { group: true }
            }
          }
        }
      }
    });

    // 2. Calculate Total "Loss" (Sum of all discounts applied to active enrollments)
    let totalDiscountAmount = 0;
    const usageCount: Record<string, { count: number; name: string; amount: number }> = {};

    (studentDiscounts as any[]).forEach(sd => {
      let studentTotalMonthlyDiscount = 0;
      
      // Calculate discount for each enrollment
      sd.student?.enrollments?.forEach(enrol => {
        const basePrice = Number(enrol.group?.price || 0);
        let discountVal = 0;
        
        if (sd.discount?.type === 'PERCENT') {
          discountVal = (basePrice * Number(sd.discount.value)) / 100;
        } else {
          discountVal = Number(sd.discount?.value || 0);
        }
        
        studentTotalMonthlyDiscount += discountVal;
      });

      totalDiscountAmount += studentTotalMonthlyDiscount;

      // Track usage
      if (sd.discount) {
        if (!usageCount[sd.discount_id]) {
          usageCount[sd.discount_id] = { count: 0, name: sd.discount.name, amount: 0 };
        }
        usageCount[sd.discount_id].count += 1;
        usageCount[sd.discount_id].amount += studentTotalMonthlyDiscount;
      }
    });

    const breakdown = Object.values(usageCount).sort((a, b) => b.amount - a.amount);

    return {
      totalLoss: totalDiscountAmount,
      studentCount: new Set(studentDiscounts.map(sd => sd.student_id)).size,
      activeDiscountsCount: studentDiscounts.length,
      breakdown
    };
  }

  async findAll(tenantId: string) {
    return this.prisma.discount.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { appliedTo: true }
        }
      }
    });
  }

  async removeAssignment(id: string) {
    return this.prisma.studentDiscount.delete({
      where: { id }
    });
  }

  async upsert(tenantId: string, data: any) {
    if (data.id) {
      return this.prisma.discount.update({
        where: { id: data.id },
        data: {
          name: data.name,
          type: data.type,
          value: data.value,
          is_active: data.is_active ?? true,
        }
      });
    }

    return this.prisma.discount.create({
      data: {
        tenant_id: tenantId,
        name: data.name,
        type: data.type,
        value: data.value,
        is_active: true
      }
    });
  }

  async assignToStudent(tenantId: string, studentId: string, discountId: string, expiresAt?: Date) {
    // Check if discount exists and belongs to tenant
    const discount = await this.prisma.discount.findFirst({
      where: { id: discountId, tenant_id: tenantId }
    });
    if (!discount) throw new Error('Chegirma topilmadi');

    return this.prisma.studentDiscount.create({
      data: {
        student_id: studentId,
        discount_id: discountId,
        expires_at: expiresAt
      }
    });
  }

  async applyDiscounts(tenantId: string, studentId: string, basePrice: number): Promise<number> {
    const now = new Date();
    // Get all active, non-expired discounts for this student
    const studentDiscounts = await this.prisma.studentDiscount.findMany({
      where: {
        student_id: studentId,
        student: {
          is: { tenant_id: tenantId }
        },
        OR: [
          { expires_at: null },
          { expires_at: { gt: now } }
        ]
      },
      include: {
        discount: true
      }
    });

    if (studentDiscounts.length === 0) return basePrice;

    let totalPercent = 0;
    let totalFixed = 0;

    studentDiscounts.forEach(sd => {
      const d = sd.discount;
      if (!d || !d.is_active) return;

      if (d.type === 'PERCENT') {
        totalPercent += Number(d.value || 0);
      } else {
        totalFixed += Number(d.value || 0);
      }
    });

    // Apply percentage discounts first (additive)
    let discountedPrice = basePrice * (1 - (totalPercent / 100));
    
    // Then subtract fixed amount discounts
    discountedPrice -= totalFixed;

    // Ensure price is not negative
    return Math.max(0, Math.round(discountedPrice));
  }

  async delete(id: string) {
    return this.prisma.discount.delete({
      where: { id }
    });
  }
}
