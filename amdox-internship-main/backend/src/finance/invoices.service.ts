import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, tenantContext } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async getInvoices(type?: string, status?: string) {
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    return this.prisma.invoice.findMany({
      where,
      include: {
        vendor: { select: { id: true, name: true, email: true } },
        payments: { select: { id: true, amount: true, date: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createInvoice(dto: CreateInvoiceDto, userId: string) {
    const ctx = tenantContext.getStore()!;
    const invoice = await this.prisma.invoice.create({
      data: { ...dto, dueDate: new Date(dto.dueDate), tenantId: ctx.tenantId, createdBy: userId },
    });
    await this.audit.createLog({ action: 'INVOICE_CREATED', entity: 'Invoice', entityId: invoice.id, userId, tenantId: ctx.tenantId });
    return invoice;
  }

  async getAgingReport() {
    const now = new Date();
    const invoices = await this.prisma.invoice.findMany({
      where: { type: 'AR', status: { not: 'Paid' } },
      include: { payments: true },
    });

    const buckets = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
    for (const inv of invoices) {
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      const outstanding = inv.totalAmount - paid;
      const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000);
      if (daysOverdue <= 0) buckets.current += outstanding;
      else if (daysOverdue <= 30) buckets.days30 += outstanding;
      else if (daysOverdue <= 60) buckets.days60 += outstanding;
      else if (daysOverdue <= 90) buckets.days90 += outstanding;
      else buckets.over90 += outstanding;
    }
    return buckets;
  }

  async recordPayment(invoiceId: string, amount: number, tenantId: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0) + amount;
    const newStatus = totalPaid >= invoice.totalAmount ? 'Paid' : 'PartiallyPaid';

    const result = await this.prisma.$transaction(async (tx: any) => {
      const p = await tx.payment.create({ data: { invoiceId, amount, tenantId } });
      await tx.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } });
      return p;
    });
    await this.audit.createLog({ action: 'PAYMENT_RECORDED', entity: 'Invoice', entityId: invoiceId, userId, tenantId });
    return result;
  }
}
