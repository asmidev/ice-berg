import { Module } from '@nestjs/common';
import { LmsService } from './lms.service';
import { LmsController } from './lms.controller';
import { SmsModule } from '../sms/sms.module';
import { DiscountsModule } from '../discounts/discounts.module';

@Module({
  imports: [SmsModule, DiscountsModule],
  controllers: [LmsController],
  providers: [LmsService],
})
export class LmsModule {}
