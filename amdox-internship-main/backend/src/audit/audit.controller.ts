import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get audit trail' })
  getLogs(@Query() filters: any) { return this.auditService.getLogs(filters); }

  @Get('verify')
  @ApiOperation({ summary: 'Verify hash-chain integrity' })
  verify(@CurrentTenant() tenantId: string) { return this.auditService.verifyIntegrity(tenantId); }
}
