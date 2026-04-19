import { Injectable, UnauthorizedException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: loginDto.phone },
      include: { 
        role: true,
        branches: { select: { id: true, name: true } },
        studentProfile: { select: { id: true, is_archived: true } },
        teacherProfile: { select: { id: true } }
      }
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password_hash))) {
      throw new UnauthorizedException('Telefon raqami yoki parol noto\'g\'ri');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Foydalanuvchi akkaunti faol emas');
    }

    if (user.studentProfile?.is_archived) {
      throw new UnauthorizedException('Siz vaqtinchalik arxivlangansiz. Tizimga kirish imkonsiz.');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const isBlacklisted = await this.cacheManager.get(`blacklist:${refreshDto.refreshToken}`);
      if (isBlacklisted) throw new UnauthorizedException('Token yaroqsiz');

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { 
          role: true,
          branches: { select: { id: true, name: true } },
          studentProfile: { select: { id: true } },
          teacherProfile: { select: { id: true } }
        }
      });
      if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

      await this.cacheManager.set(`blacklist:${refreshDto.refreshToken}`, true, 7 * 24 * 60 * 60 * 1000);

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Token yaroqsiz yoki muddati o\'tgan');
    }
  }

  async logout(userId: string, refreshToken: string) {
    await this.cacheManager.set(`blacklist:${refreshToken}`, true, 7 * 24 * 60 * 60 * 1000);
    return { success: true };
  }

  async updateProfile(userId: string, profileData: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email
      }
    });
  }

  async updatePassword(userId: string, passwordData: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');
    
    if (!(await bcrypt.compare(passwordData.oldPassword, user.password_hash))) {
      throw new UnauthorizedException('Joriy parol xato!');
    }
    
    const newHash = await bcrypt.hash(passwordData.newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newHash }
    });
  }

  private async generateTokens(user: any) {
    const payload = { 
      sub: user.id, 
      tenantId: user.tenant_id, 
      roleSlug: user.role.slug,
      permissions: user.role.permissions || [] 
    };
    
    const accessTokenSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error('JWT secrets are not configured in environment variables');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessTokenSecret,
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshTokenSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role.slug,
        tenantId: user.tenant_id,
        branches: user.branches || [],
        studentId: user.studentProfile?.id,
        teacherId: user.teacherProfile?.id
      }
    };
  }
}
