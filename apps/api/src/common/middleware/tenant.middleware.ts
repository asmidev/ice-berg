import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ContextService } from '../context/context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly contextService: ContextService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    let tenantId = (req.headers['x-tenant-id'] as string) || (req.headers['tenant-id'] as string);
    let userId: string | undefined;

    if (!tenantId && req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        try {
          const decoded: any = this.jwtService.decode(token);
          if (decoded) {
            if (decoded.tenantId) tenantId = decoded.tenantId;
            if (decoded.sub) userId = decoded.sub;
          }
        } catch (e) {
          // Token decoding failure is handled by AuthGuard downstream
        }
      }
    }

    if (tenantId) {
      (req as any).tenantId = tenantId;
    }

    this.contextService.run({ tenantId, userId }, () => {
      next();
    });
  }
}
