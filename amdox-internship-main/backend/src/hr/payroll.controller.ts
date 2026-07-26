import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { PayrollService } from './payroll.service';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get('runs')
  @ApiOperation({ summary: 'List payroll runs' })
  getRuns() { return this.payrollService.getPayrollRuns(); }

  @Post('run')
  @ApiOperation({ summary: 'Initiate payroll run (queued via BullMQ)' })
  runPayroll(@Body() body: any, @CurrentUser() user: any, @CurrentTenant() tenantId: string) {
    return this.payrollService.runPayroll(body.period, body.periodStart, body.periodEnd, user.userId, tenantId);
  }

  @Get('payslips')
  @ApiOperation({ summary: 'Get payslips' })
  getPayslips(@Query('employeeId') employeeId?: string, @Query('payrollRunId') runId?: string) {
    return this.payrollService.getPayslips(employeeId, runId);
  }
}
