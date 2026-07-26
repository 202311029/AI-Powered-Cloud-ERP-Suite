import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService, tenantContext } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

// Indian tax slabs 2026 (old regime)
const TAX_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300001, max: 700000, rate: 0.05 },
  { min: 700001, max: 1000000, rate: 0.10 },
  { min: 1000001, max: 1200000, rate: 0.15 },
  { min: 1200001, max: 1500000, rate: 0.20 },
  { min: 1500001, max: Infinity, rate: 0.30 },
];

function calcIncomeTax(annualIncome: number): number {
  let tax = 0;
  for (const slab of TAX_SLABS) {
    if (annualIncome <= slab.min) break;
    const taxable = Math.min(annualIncome, slab.max) - slab.min;
    tax += taxable * slab.rate;
  }
  return tax / 12; // Monthly TDS
}

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('payroll') private payrollQueue: Queue,
    private audit: AuditService,
  ) {}

  async getPayrollRuns() {
    return this.prisma.payrollRun.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { payslips: true } } },
    });
  }

  async runPayroll(period: string, periodStart: string, periodEnd: string, userId: string, tenantId: string) {
    const ctx = tenantContext.getStore()!;

    // Create payroll run record
    const run = await this.prisma.payrollRun.create({
      data: {
        period,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'Processing',
        tenantId: ctx.tenantId,
        runBy: userId,
      },
    });

    // Queue the actual payroll processing
    await this.payrollQueue.add('process-payroll', { payrollRunId: run.id, tenantId: ctx.tenantId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    await this.audit.createLog({ action: 'PAYROLL_RUN_INITIATED', entity: 'PayrollRun', entityId: run.id, userId, tenantId: ctx.tenantId });
    return run;
  }

  async processPayrollSync(payrollRunId: string, tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, isActive: true },
    });

    let totalGross = 0, totalNet = 0;
    const run = await this.prisma.payrollRun.findUnique({ where: { id: payrollRunId } });
    if (!run) return;

    for (const emp of employees) {
      const gross = emp.baseSalary || 50000;
      const basic = gross * 0.5;
      const hra = gross * 0.2;
      const special = gross * 0.3;

      // Indian deductions
      const pfEmployee = basic * 0.12;
      const pfEmployer = basic * 0.12;
      const esi = gross <= 21000 ? gross * 0.0075 : 0;
      const esiEmployer = gross <= 21000 ? gross * 0.0325 : 0;
      const pt = 200;
      const tds = calcIncomeTax(gross * 12);

      const totalDeductions = pfEmployee + esi + pt + tds;
      const netPay = gross - totalDeductions;

      totalGross += gross;
      totalNet += netPay;

      await this.prisma.payslip.create({
        data: {
          payrollRunId,
          employeeId: emp.id,
          period: run.period,
          basicPay: basic,
          hra,
          specialAllowance: special,
          grossPay: gross,
          pfEmployee,
          pfEmployer,
          esiEmployee: esi,
          esiEmployer,
          professionalTax: pt,
          tds,
          totalDeductions,
          netPay,
          tenantId,
        },
      });
    }

    await this.prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: { status: 'Completed', totalGross, totalNet, employeeCount: employees.length, completedAt: new Date() },
    });
  }

  async getPayslips(employeeId?: string, payrollRunId?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (payrollRunId) where.payrollRunId = payrollRunId;
    return this.prisma.payslip.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, department: true, designation: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
