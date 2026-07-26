import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [HttpModule, BullModule.registerQueue({ name: 'finance' })],
  controllers: [FinanceController, InvoicesController],
  providers: [FinanceService, InvoicesService],
  exports: [FinanceService, InvoicesService],
})
export class FinanceModule {}
