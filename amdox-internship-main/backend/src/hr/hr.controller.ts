import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { HrService } from './hr.service';

@ApiTags('HR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('employees')
  @ApiOperation({ summary: 'List all employees' })
  getEmployees(@Query() filters: any) { return this.hrService.getEmployees(filters); }

  @Get('employees/org-chart')
  @ApiOperation({ summary: 'Get org chart tree' })
  getOrgChart() { return this.hrService.getOrgChart(); }

  @Get('employees/:id')
  getEmployee(@Param('id') id: string) { return this.hrService.getEmployee(id); }

  @Post('employees')
  @ApiOperation({ summary: 'Create employee' })
  createEmployee(@Body() data: any, @CurrentUser() user: any) {
    return this.hrService.createEmployee(data, user.userId);
  }

  @Put('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.hrService.updateEmployee(id, data, user.userId);
  }

  @Get('leave')
  @ApiOperation({ summary: 'List leave requests' })
  getLeaveRequests(@Query('employeeId') employeeId?: string, @Query('status') status?: string) {
    return this.hrService.getLeaveRequests(employeeId, status);
  }

  @Post('leave')
  @ApiOperation({ summary: 'Submit leave request' })
  createLeaveRequest(@Body() data: any, @CurrentUser() user: any) {
    return this.hrService.createLeaveRequest(data, user.userId);
  }

  @Put('leave/:id/approve')
  @ApiOperation({ summary: 'Approve or reject leave request' })
  approveLeave(@Param('id') id: string, @Body('approved') approved: boolean, @CurrentUser() user: any) {
    return this.hrService.approveLeave(id, approved, user.userId);
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Get attendance records' })
  getAttendance(@Query('employeeId') employeeId?: string, @Query('date') date?: string) {
    return this.hrService.getAttendance(employeeId, date);
  }

  @Post('attendance/clock-in')
  @ApiOperation({ summary: 'Clock in' })
  clockIn(@Body('employeeId') employeeId: string, @CurrentTenant() tenantId: string) {
    return this.hrService.clockIn(employeeId, tenantId);
  }

  @Post('attendance/clock-out')
  @ApiOperation({ summary: 'Clock out' })
  clockOut(@Body('employeeId') employeeId: string, @CurrentTenant() tenantId: string) {
    return this.hrService.clockOut(employeeId, tenantId);
  }
}
