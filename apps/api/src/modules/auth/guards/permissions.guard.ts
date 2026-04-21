import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions) {
      return true; // No specific permissions required based on this guard
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
       throw new ForbiddenException('Tizimga kirmagansiz (Unauthorized)');
    }

    const roleSlug = (user.roleSlug || user.role?.slug || typeof user.role === 'string' ? user.role : '').toLowerCase();
    
    // Super-Admin override
    if (roleSlug === 'super-admin' || roleSlug === 'super_admin' || roleSlug === 'bosh_admin' || roleSlug === 'bosh-admin' || roleSlug === 'super admin') {
      return true; 
    }

    const userPermissions = user.permissions || [];
    
    const hasPermission = requiredPermissions.some((permission) => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
       throw new ForbiddenException('Ushbu amalni bajarish uchun sizda yetarli ruxsat (huquq) yo\'q');
    }

    return true;
  }
}
