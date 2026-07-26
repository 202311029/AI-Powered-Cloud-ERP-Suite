import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices (AP or AR)' })
  getInvoices(@Query('type') type?: string, @Query('status') status?: string) {
    return this.invoicesService.getInvoices(type, status);
  }

  @Post()
  @ApiOperation({ summary: 'Create AP/AR invoice' })
  createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.createInvoice(dto, user.userId);
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'AR aging report (30/60/90 day buckets)' })
  getAgingReport() { return this.invoicesService.getAgingReport(); }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record payment against invoice' })
  recordPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.recordPayment(id, amount, tenantId, user.userId);
  }
}
