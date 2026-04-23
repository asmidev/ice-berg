import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getAllStaff(tenantId: string, branchId?: string, query?: any) {
    const isArchived = query?.is_archived === 'true';
    
    return this.prisma.user.findMany({
      where: {
        tenant_id: tenantId,
        role: {
          slug: { notIn: ['student', 'teacher'] }
        },
        ...(branchId && branchId !== 'all' ? { branches: { some: { id: branchId } } } : {}),
        staffProfile: {
          is_archived: isArchived
        }
      },
      include: {
        role: true,
        staffProfile: true,
        branches: { select: { id: true, name: true } }
      },
      orderBy: { first_name: 'asc' }
    });
  }

  async getArchiveStats(tenantId: string, branchId?: string) {
    const where: any = { tenant_id: tenantId, is_archived: true };
    if (branchId && branchId !== 'all') where.branch_id = branchId;

    const [totalArchive, recent] = await Promise.all([
      this.prisma.staff.count({ where }),
      this.prisma.staff.count({
        where: {
          ...where,
          archived_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    return { totalArchive, recent, older: totalArchive - recent };
  }

  async createStaff(tenantId: string, data: any) {
    const existing = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw new ConflictException('Ushbu telefon raqami bilan foydalanuvchi mavjud');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenant_id: tenantId,
          phone: data.phone,
          password_hash: hashedPassword,
          first_name: data.first_name,
          last_name: data.last_name,
          role_id: data.role_id,
          is_active: data.is_active !== undefined ? data.is_active : true,
          branches: {
            connect: data.branch_ids ? data.branch_ids.map((id: string) => ({ id })) : []
          }
        }
      });

      await tx.staff.create({
        data: {
          tenant_id: tenantId,
          user_id: user.id,
          // We keep branch_id for backward compatibility if needed, 
          // but mainly we use the user.branches relation now
          branch_id: data.branch_ids?.[0] || null 
        }
      });

      return user;
    });
  }

  async updateStaff(tenantId: string, id: string, data: any) {
    const user = await this.prisma.user.findUnique({ 
      where: { id },
      include: { staffProfile: true }
    });
    if (!user || user.tenant_id !== tenantId) throw new NotFoundException('Xodim topilmadi');

    const updateData: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role_id: data.role_id,
      is_active: data.is_active !== undefined ? data.is_active : true,
    };

    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }

    if (data.branch_ids) {
      updateData.branches = {
        set: data.branch_ids.map((id: string) => ({ id }))
      };
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true, branches: true }
    });
  }

  async deleteStaff(tenantId: string, id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.tenant_id !== tenantId) throw new NotFoundException('Xodim topilmadi');
    
    // Check if role is critical
    const role = await this.prisma.role.findUnique({ where: { id: user.role_id } });
    if (role?.slug === 'super-admin') {
      throw new ConflictException('Super Adminni o\'chirib bo\'lmaydi');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { is_active: false }
      });
      return tx.staff.update({
        where: { user_id: id },
        data: { is_archived: true, archived_at: new Date() }
      });
    });
  }

  async archiveStaff(tenantId: string, id: string, reason: string) {
     const user = await this.prisma.user.findUnique({ 
       where: { id },
       include: { staffProfile: true }
     });
     if (!user || user.tenant_id !== tenantId) throw new NotFoundException('Xodim topilmadi');

     return this.prisma.$transaction(async (tx) => {
        await tx.user.update({
           where: { id },
           data: { is_active: false }
        });
        return tx.staff.update({
           where: { user_id: id },
           data: { 
              is_archived: true, 
              archived_at: new Date(),
              archive_reason: reason
           }
        });
     });
  }

  async restoreStaff(tenantId: string, id: string) {
     const user = await this.prisma.user.findUnique({ 
       where: { id },
       include: { staffProfile: true }
     });
     if (!user || user.tenant_id !== tenantId) throw new NotFoundException('Xodim topilmadi');

     return this.prisma.$transaction(async (tx) => {
        await tx.user.update({
           where: { id },
           data: { is_active: true }
        });
        return tx.staff.update({
           where: { user_id: id },
           data: { 
              is_archived: false,
              archived_at: null,
              archive_reason: null
           }
        });
     });
  }

  async bulkCreateStaff(tenantId: string, data: { branchId: string, staff: any[] }) {
    const { branchId, staff } = data;

    return await this.prisma.$transaction(async (prisma) => {
      const roles = await prisma.role.findMany();

      const processedStaff = await Promise.all(staff.map(async (s) => {
        try {
          const existing = await prisma.user.findUnique({ where: { phone: s.phone } });
          if (existing) {
            return { success: false, error: `Foydalanuvchi mavjud: ${s.phone}` };
          }

          let roleId = null;
          if (s.role) {
            const role = roles.find(r => r.name.toLowerCase() === s.role.toLowerCase() || r.slug.toLowerCase() === s.role.toLowerCase());
            if (role) roleId = role.id;
          }

          if (!roleId) {
             return { success: false, error: `Rol topilmadi (${s.role}): ${s.first_name}` };
          }

          const hashedPassword = await bcrypt.hash(s.password || '123456', 10);

          const user = await prisma.user.create({
            data: {
              tenant_id: tenantId,
              phone: s.phone,
              password_hash: hashedPassword,
              first_name: s.first_name,
              last_name: s.last_name || '',
              role_id: roleId,
              is_active: true,
              branches: {
                connect: branchId !== 'all' ? [{ id: branchId }] : []
              }
            }
          });

          await prisma.staff.create({
            data: {
              tenant_id: tenantId,
              user_id: user.id,
              branch_id: branchId !== 'all' ? branchId : null
            }
          });

          return { success: true };
        } catch (e: any) {
          return { success: false, error: `Xatolik (${s.first_name}): ${e.message}` };
        }
      }));

      const successCount = processedStaff.filter(r => r.success).length;
      const errors = processedStaff.filter(r => !r.success).map(r => r.error);

      return {
        success: true,
        count: successCount,
        errors
      };
    });
  }
}
