import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService, tenantContext } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuditService } from '../audit/audit.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ClosePeriodDto } from './dto/close-period.dto';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private audit: AuditService,
  ) {}

  // ─── Chart of Accounts ───────────────────────────────────────────────────
  async getAccounts() {
    return this.prisma.account.findMany({
      include: { children: { select: { id: true, code: true, name: true, type: true } } },
      where: { parentId: null }, // Top-level only
      orderBy: { code: 'asc' },
    });
  }

  async createAccount(dto: CreateAccountDto, userId: string) {
    const ctx = tenantContext.getStore()!;
    const account = await this.prisma.account.create({
      data: { ...dto, tenantId: ctx.tenantId },
    });
    await this.audit.createLog({ action: 'ACCOUNT_CREATED', entity: 'Account', entityId: account.id, userId, tenantId: ctx.tenantId });
    return account;
  }

  // ─── Journal Entries ─────────────────────────────────────────────────────
  async getJournalEntries(filters: { status?: string; periodId?: string; from?: string; to?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.periodId) where.periodId = filters.periodId;
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) where.date.lte = new Date(filters.to);
    }

    return this.prisma.journalEntry.findMany({
      where,
      include: {
        lines: { include: { account: { select: { code: true, name: true, type: true } } } },
        period: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  async createJournalEntry(dto: CreateJournalEntryDto, userId: string) {
    const ctx = tenantContext.getStore()!;

    // Validate double-entry: sum of debits must equal sum of credits
    const totalDebits = dto.lines.filter(l => l.type === 'Debit').reduce((s, l) => s + l.amount, 0);
    const totalCredits = dto.lines.filter(l => l.type === 'Credit').reduce((s, l) => s + l.amount, 0);
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException(
        `Double-entry imbalance: debits (${totalDebits}) ≠ credits (${totalCredits})`
      );
    }

    const entry = await this.prisma.$transaction(async (tx) => {
      const je = await tx.journalEntry.create({
        data: {
          description: dto.description,
          date: dto.date ? new Date(dto.date) : new Date(),
          currency: dto.currency || 'INR',
          exchangeRate: dto.exchangeRate || 1.0,
          status: 'Posted',
          periodId: dto.periodId,
          tenantId: ctx.tenantId,
          createdBy: userId,
        },
      });
      await tx.journalLine.createMany({
        data: dto.lines.map(l => ({
          journalEntryId: je.id,
          accountId: l.accountId,
          type: l.type as any,
          amount: l.amount,
          description: l.description,
          tenantId: ctx.tenantId,
        })),
      });
      return je;
    });

    await this.audit.createLog({ action: 'JOURNAL_ENTRY_CREATED', entity: 'JournalEntry', entityId: entry.id, userId, tenantId: ctx.tenantId });
    return this.prisma.journalEntry.findUnique({ where: { id: entry.id }, include: { lines: { include: { account: true } } } });
  }

  // ─── Financial Periods ────────────────────────────────────────────────────
  async getPeriods() {
    return this.prisma.financialPeriod.findMany({ orderBy: { startDate: 'desc' } });
  }

  async closePeriod(dto: ClosePeriodDto, userId: string) {
    const ctx = tenantContext.getStore()!;
    const period = await this.prisma.financialPeriod.findUnique({ where: { id: dto.periodId } });
    if (!period) throw new NotFoundException('Period not found');
    if (period.isClosed) throw new BadRequestException('Period already closed');

    const updated = await this.prisma.financialPeriod.update({
      where: { id: dto.periodId },
      data: { isClosed: true, closedAt: new Date(), closedBy: userId },
    });
    await this.audit.createLog({ action: 'PERIOD_CLOSED', entity: 'FinancialPeriod', entityId: dto.periodId, userId, tenantId: ctx.tenantId });
    return updated;
  }

  // ─── FX Rates (frankfurter.app) ───────────────────────────────────────────
  async getFxRates() {
    return this.prisma.fxRate.findMany({ orderBy: { date: 'desc' }, take: 50 });
  }

  async refreshFxRates(tenantId: string) {
    try {
      const res: any = await firstValueFrom(
        this.http.get('https://api.frankfurter.app/latest?base=USD&symbols=INR,EUR,GBP,AED,SGD')
      );
      const rates = res.data.rates;
      for (const [quote, rate] of Object.entries(rates)) {
        await this.prisma.fxRate.create({
          data: { baseCurrency: 'USD', quoteCurrency: quote, rate: rate as number, tenantId },
        });
      }
      return { updated: Object.keys(rates).length, source: 'frankfurter.app' };
    } catch {
      return { error: 'FX service unavailable', cached: true };
    }
  }

  // ─── Trial Balance (GL Summary) ───────────────────────────────────────────
  async getTrialBalance() {
    const lines = await this.prisma.journalLine.findMany({
      include: { account: { select: { code: true, name: true, type: true } } },
    });

    const balances: Record<string, { code: string; name: string; type: string; debit: number; credit: number }> = {};
    for (const line of lines) {
      const key = line.accountId;
      if (!balances[key]) {
        balances[key] = { code: line.account.code, name: line.account.name, type: line.account.type, debit: 0, credit: 0 };
      }
      if (line.type === 'Debit') balances[key].debit += line.amount;
      else balances[key].credit += line.amount;
    }

    return Object.values(balances).sort((a, b) => a.code.localeCompare(b.code));
  }
}
