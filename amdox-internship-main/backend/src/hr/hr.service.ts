import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, tenantContext } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  // ─── Employees ────────────────────────────────────────────────────────────
  async getEmployees(filters: { department?: string; isActive?: boolean }) {
    const where: any = {};
    if (filters.department) where.department = filters.department;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    return this.prisma.employee.findMany({
      where,
      orderBy: [{ department: 'asc' }, { lastName: 'asc' }],
    });
  }

  async getEmployee(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        leaveRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
        leaveBalances: true,
        payslips: { orderBy: { createdAt: 'desc' }, take: 3 },
        directReports: { select: { id: true, firstName: true, lastName: true, designation: true } },
      },
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async createEmployee(data: any, userId: string) {
    const ctx = tenantContext.getStore()!;
    const emp = await this.prisma.employee.create({ data: { ...data, tenantId: ctx.tenantId } });
    await this.audit.createLog({ action: 'EMPLOYEE_CREATED', entity: 'Employee', entityId: emp.id, userId, tenantId: ctx.tenantId });
    return emp;
  }

  async updateEmployee(id: string, data: any, userId: string) {
    const ctx = tenantContext.getStore()!;
    const emp = await this.prisma.employee.update({ where: { id }, data });
    await this.audit.createLog({ action: 'EMPLOYEE_UPDATED', entity: 'Employee', entityId: id, userId, tenantId: ctx.tenantId, changes: data });
    return emp;
  }

  // ─── Org Chart (recursive CTE via Prisma) ─────────────────────────────────
  async getOrgChart() {
    const employees = await this.prisma.employee.findMany({
      select: { id: true, firstName: true, lastName: true, designation: true, department: true, managerId: true, isActive: true },
      where: { isActive: true },
    });

    // Build tree
    const map = new Map(employees.map(e => [e.id, { ...e, children: [] as any[] }]));
    const roots: any[] = [];
    for (const emp of map.values()) {
      if (emp.managerId && map.has(emp.managerId)) {
        map.get(emp.managerId)!.children.push(emp);
      } else {
        roots.push(emp);
      }
    }
    return roots;
  }

  // ─── Leave Management ─────────────────────────────────────────────────────
  async getLeaveRequests(employeeId?: string, status?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    return this.prisma.leaveRequest.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, department: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLeaveRequest(data: any, userId: string) {
    const ctx = tenantContext.getStore()!;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
    return this.prisma.leaveRequest.create({
      data: { ...data, startDate, endDate, days, status: 'Pending', tenantId: ctx.tenantId },
    });
  }

  async approveLeave(id: string, approved: boolean, userId: string) {
    const ctx = tenantContext.getStore()!;
    const status = approved ? 'Approved' : 'Rejected';
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status, approvedBy: userId, approvedAt: new Date() },
    });
    await this.audit.createLog({ action: `LEAVE_${status}`, entity: 'LeaveRequest', entityId: id, userId, tenantId: ctx.tenantId });
    return updated;
  }

  // ─── Attendance ───────────────────────────────────────────────────────────
  async getAttendance(employeeId?: string, date?: string) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (date) where.date = { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) };
    return this.prisma.attendanceLog.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, department: true } } },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async clockIn(employeeId: string, tenantId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return this.prisma.attendanceLog.upsert({
      where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } },
      update: { checkIn: new Date() },
      create: { employeeId, date: today, checkIn: new Date(), status: 'Present', tenantId },
    });
  }

  async clockOut(employeeId: string, tenantId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const log = await this.prisma.attendanceLog.findUnique({
      where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } },
    });
    if (!log?.checkIn) throw new NotFoundException('No clock-in record for today');
    const hoursWorked = (Date.now() - log.checkIn.getTime()) / 3600000;
    const overtime = Math.max(0, hoursWorked - 8);
    return this.prisma.attendanceLog.update({
      where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } },
      data: { checkOut: new Date(), hoursWorked: parseFloat(hoursWorked.toFixed(2)), overtime: parseFloat(overtime.toFixed(2)) },
    });
  }
}
