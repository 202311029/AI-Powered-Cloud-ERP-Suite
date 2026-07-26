import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BiService } from './bi.service';

@ApiTags('BI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bi')
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard KPI summary' })
  getSummary() { return this.biService.getDashboardSummary(); }

  @Get('revenue-by-month')
  @ApiOperation({ summary: 'Revenue & expenses by month' })
  getRevenueByMonth() { return this.biService.getRevenueByMonth(); }
}
