import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { SmsModule } from '../sms/sms.module';

import { PaymentCategoriesController } from './payment-categories.controller';
import { PaymentCategoriesService } from './payment-categories.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [SmsModule],
  controllers: [FinanceController, PaymentCategoriesController, SettingsController],
  providers: [FinanceService, PaymentCategoriesService, SettingsService],
})
export class FinanceModule {}
