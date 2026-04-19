import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../../prisma/generated-client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ContextService } from '../context/context.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private _extendedClient: any;

  constructor(private readonly contextService: ContextService) {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ 
      connectionString,
      max: 30,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter } as any);

    this._extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenantId = ContextService.getTenantId();
            if (!tenantId) return query(args);

            // Models that do NOT have tenant_id
            const excludedModels = ['Tenant', 'Role', 'Enrollment', 'Attendance', 'Schedule', 'Exam', 'Grade', 'Assignment', 'Submission'];
            if (excludedModels.includes(model)) return query(args);

            if (['findFirst', 'findMany', 'count', 'update', 'updateMany', 'delete', 'deleteMany', 'aggregate', 'groupBy'].includes(operation)) {
              const a = args as any;
              a.where = { ...a.where, tenant_id: tenantId };
            }

            if (operation === 'create' || operation === 'upsert') {
              const a = args as any;
              if (operation === 'create') {
                a.data = { ...a.data, tenant_id: tenantId };
              } else {
                a.create = { ...a.create, tenant_id: tenantId };
                a.update = { ...a.update, tenant_id: tenantId };
              }
            }

            return query(args);
          },
        },
      },
    });

    // Return a proxy so that all calls to PrismaService are redirected to the extended client
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target._extendedClient) {
          return target._extendedClient[prop];
        }
        return (target as any)[prop];
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
