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

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Safety check
    if (!user) {
      return false;
    }

    const roleRaw = user.roleSlug || user.role?.slug || (typeof user.role === 'string' ? user.role : '');
    const roleSlug = (roleRaw || '').toLowerCase();

    // Super Admin has all permissions bypass
    if (roleSlug === 'super-admin' || roleSlug === 'super_admin' || roleSlug === 'bosh_admin' || roleSlug === 'bosh-admin' || roleSlug === 'super admin') {
      return true;
    }

    // Check if user has ALL required permissions
    const userPermissions = user.permissions || [];
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Ushbu amalni bajarish uchun sizda yetarli huquqlar mavjud emas');
    }

    return true;
  }
}
