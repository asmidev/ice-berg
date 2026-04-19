import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  tenantId?: string;
  userId?: string;
}

@Injectable()
export class ContextService {
  private static readonly als = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, callback: () => any) {
    return ContextService.als.run(context, callback);
  }

  static getTenantId(): string | undefined {
    return ContextService.als.getStore()?.tenantId;
  }

  static getUserId(): string | undefined {
    return ContextService.als.getStore()?.userId;
  }

  get tenantId(): string | undefined {
    return ContextService.getTenantId();
  }

  get userId(): string | undefined {
    return ContextService.getUserId();
  }
}
