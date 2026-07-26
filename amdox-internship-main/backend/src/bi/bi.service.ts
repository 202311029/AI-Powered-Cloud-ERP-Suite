import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BiService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    const [employees, vendors, invoices, projects, inventory, payrollRuns] = await Promise.all([
      this.prisma.employee.count({ where: { isActive: true } }),
      this.prisma.vendor.count({ where: { isActive: true } }),
      this.prisma.invoice.findMany({ select: { totalAmount: true, type: true, status: true } }),
      this.prisma.project.count({ where: { status: 'Active' } }),
      this.prisma.inventoryItem.count(),
      this.prisma.payrollRun.findFirst({ where: { status: 'Completed' }, orderBy: { createdAt: 'desc' } }),
    ]);

    const revenue = invoices.filter(i => i.type === 'AR').reduce((s, i) => s + i.totalAmount, 0);
    const expenses = invoices.filter(i => i.type === 'AP').reduce((s, i) => s + i.totalAmount, 0);
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue').length;

    return {
      totalEmployees: employees,
      totalVendors: vendors,
      activeProjects: projects,
      totalSKUs: inventory,
      revenue,
      expenses,
      netIncome: revenue - expenses,
      overdueInvoices,
      lastPayroll: payrollRuns ? { period: payrollRuns.period, totalNet: payrollRuns.totalNet } : null,
    };
  }

  async getRevenueByMonth() {
    const entries = await this.prisma.journalEntry.findMany({
      where: { status: 'Posted' },
      include: { lines: { include: { account: true } } },
      orderBy: { date: 'asc' },
    });

    const monthly: Record<string, { revenue: number; expense: number }> = {};
    for (const je of entries) {
      const month = je.date.toISOString().slice(0, 7);
      if (!monthly[month]) monthly[month] = { revenue: 0, expense: 0 };
      for (const line of je.lines) {
        if (line.account.type === 'Revenue' && line.type === 'Credit') monthly[month].revenue += line.amount;
        if (line.account.type === 'Expense' && line.type === 'Debit') monthly[month].expense += line.amount;
      }
    }

    return Object.entries(monthly).map(([month, data]) => ({ month, ...data }));
  }
}
