// @ts-nocheck
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContextModule } from './common/context/context.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BranchesModule } from './modules/branches/branches.module';
import { CrmModule } from './modules/crm/crm.module';
import { StudentsModule } from './modules/students/students.module';
import { FinanceModule } from './modules/finance/finance.module';
import { LmsModule } from './modules/lms/lms.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { RolesModule } from './modules/roles/roles.module';
import { StaffModule } from './modules/staff/staff.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomerModule } from './modules/customer/customer.module';
import { SmsModule } from './modules/sms/sms.module';
import { ReceiptTemplatesModule } from './modules/receipt-templates/receipt-templates.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { PenaltyModule } from './modules/penalty/penalty.module';
import { CallCenterModule } from './modules/call-center/call-center.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // store: await redisStore({ url: configService.get<string>('REDIS_URL', 'redis://localhost:6379') }),
        ttl: 60000, // using default memory cache for local dev explicitly
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    ContextModule,
    AnalyticsModule,
    BranchesModule,
    CrmModule,
    StudentsModule,
    FinanceModule,
    LmsModule,
    NotificationsModule,
    TeachersModule,
    RolesModule,
    StaffModule,
    InventoryModule,
    CustomerModule,
    SmsModule,
    ReceiptTemplatesModule,
    AttendanceModule,
    DiscountsModule,
    PenaltyModule,
    CallCenterModule,
    TenantModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
