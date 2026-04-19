import { Module } from '@nestjs/common';
import { ReceiptTemplatesController } from './receipt-templates.controller';
import { ReceiptTemplatesService } from './receipt-templates.service';

@Module({
  controllers: [ReceiptTemplatesController],
  providers: [ReceiptTemplatesService],
})
export class ReceiptTemplatesModule {}
