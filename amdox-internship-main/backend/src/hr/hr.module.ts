import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollProcessor } from './payroll.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'payroll' })],
  controllers: [HrController, PayrollController],
  providers: [HrService, PayrollService, PayrollProcessor],
  exports: [HrService],
})
export class HrModule {}
