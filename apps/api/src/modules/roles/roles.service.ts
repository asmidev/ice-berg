import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PERMISSIONS } from './permissions.constants';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' }
    });
  }

  async getAvailablePermissions() {
    return PERMISSIONS;
  }

  async getRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { users: { select: { id: true, first_name: true, last_name: true } } }
    });
    if (!role) throw new NotFoundException('Lavozim topilmadi');
    return role;
  }

  async createRole(data: { name: string; slug: string; permissions: string[] }) {
    const existing = await this.prisma.role.findUnique({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Bunday slug bilan lavozim allaqachon mavjud');

    return this.prisma.role.create({
      data: {
        name: data.name,
        slug: data.slug,
        permissions: data.permissions
      }
    });
  }

  async updateRole(id: string, data: { name?: string; permissions?: string[] }) {
    const role = await this.getRoleById(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name || undefined,
        permissions: data.permissions || undefined
      }
    });
  }

  async deleteRole(id: string) {
    const role = await this.getRoleById(id);
    if (role.slug === 'super-admin' || role.slug === 'admin') {
      throw new ConflictException('Tizim uchun muhim lavozimlarni o\'chirib bo\'lmaydi');
    }
    return this.prisma.role.delete({ where: { id } });
  }
}
