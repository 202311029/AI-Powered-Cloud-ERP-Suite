import { Controller, Get, Post, Body, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { FinanceService } from './finance.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { ClosePeriodDto } from './dto/close-period.dto';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'Get chart of accounts' })
  getAccounts() { return this.financeService.getAccounts(); }

  @Post('accounts')
  @ApiOperation({ summary: 'Create account' })
  createAccount(@Body() dto: CreateAccountDto, @CurrentUser() user: any) {
    return this.financeService.createAccount(dto, user.userId);
  }

  @Get('journal')
  @ApiOperation({ summary: 'Get journal entries' })
  getJournalEntries(@Query() filters: any) { return this.financeService.getJournalEntries(filters); }

  @Post('journal')
  @ApiOperation({ summary: 'Create double-entry journal entry' })
  createJournalEntry(@Body() dto: CreateJournalEntryDto, @CurrentUser() user: any) {
    return this.financeService.createJournalEntry(dto, user.userId);
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get financial periods' })
  getPeriods() { return this.financeService.getPeriods(); }

  @Patch('period-close')
  @ApiOperation({ summary: 'Close financial period (locks backdating)' })
  closePeriod(@Body() dto: ClosePeriodDto, @CurrentUser() user: any) {
    return this.financeService.closePeriod(dto, user.userId);
  }

  @Get('fx-rates')
  @ApiOperation({ summary: 'Get FX rates' })
  getFxRates() { return this.financeService.getFxRates(); }

  @Post('fx-rates/refresh')
  @ApiOperation({ summary: 'Refresh FX rates from frankfurter.app' })
  refreshFxRates(@CurrentTenant() tenantId: string) {
    return this.financeService.refreshFxRates(tenantId);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance' })
  getTrialBalance() { return this.financeService.getTrialBalance(); }
}
