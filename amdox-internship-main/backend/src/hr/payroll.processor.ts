import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PayrollService } from './payroll.service';

@Processor('payroll')
export class PayrollProcessor extends WorkerHost {
  private readonly logger = new Logger(PayrollProcessor.name);

  constructor(private payrollService: PayrollService) { super(); }

  async process(job: Job) {
    const { payrollRunId, tenantId } = job.data;
    this.logger.log(`Processing payroll run: ${payrollRunId}`);
    try {
      await this.payrollService.processPayrollSync(payrollRunId, tenantId);
      this.logger.log(`Payroll run ${payrollRunId} completed successfully`);
    } catch (err: any) {
      this.logger.error(`Payroll run ${payrollRunId} failed: ${err.message}`);
      throw err; // BullMQ will retry
    }
  }
}
