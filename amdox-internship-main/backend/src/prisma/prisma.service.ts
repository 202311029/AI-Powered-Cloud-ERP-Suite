import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { AsyncLocalStorage } from 'async_hooks';

// Tenant context stored per-request (AsyncLocalStorage = no globals, thread-safe)
export const tenantContext = new AsyncLocalStorage<{ tenantId: string; userId: string }>();

// Models that are tenant-scoped
const TENANT_SCOPED_MODELS = new Set([
  'Account', 'JournalEntry', 'JournalLine', 'FinancialPeriod', 'FxRate',
  'Invoice', 'Payment', 'Employee', 'LeaveRequest', 'LeaveBalance',
  'AttendanceLog', 'PayrollRun', 'Payslip', 'Vendor', 'PurchaseOrder',
  'GoodsReceipt', 'Warehouse', 'InventoryItem', 'DemandForecast',
  'Project', 'Milestone', 'Task', 'ResourceAssignment', 'Budget',
  'Timesheet', 'Dashboard', 'Widget', 'ScheduledReport', 'AuditLog',
  'Notification', 'NotificationPreference', 'Webhook', 'WebhookDelivery',
  'RefreshToken', 'TenantUser', 'Role',
]);

const SOFT_DELETE_MODELS = new Set([
  'Account', 'Invoice', 'Employee', 'Vendor', 'PurchaseOrder',
  'InventoryItem', 'Project', 'Task', 'Dashboard',
]);

const READ_ACTIONS = new Set(['findFirst', 'findMany', 'findUnique', 'count', 'aggregate', 'groupBy']);
const WRITE_ACTIONS = new Set(['update', 'updateMany', 'delete', 'deleteMany']);

// pg Pool — shared across the service lifetime
let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

function buildExtendedClient() {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          const ctx = tenantContext.getStore();
          const isTenantScoped = model && TENANT_SCOPED_MODELS.has(model);
          const isSoftDelete = model && SOFT_DELETE_MODELS.has(model);

          // ── Soft-delete: convert delete → update(deletedAt) ──────────────
          if (isSoftDelete) {
            if (operation === 'delete') {
              return query({ ...args, action: 'update', data: { deletedAt: new Date() } });
            }
            if (operation === 'deleteMany') {
              return query({ ...args, data: { deletedAt: new Date() } });
            }
            // Exclude soft-deleted records on reads
            if (['findFirst', 'findMany', 'count'].includes(operation)) {
              args = { ...args, where: { ...args?.where, deletedAt: null } };
            }
          }

          // ── Tenant scoping ────────────────────────────────────────────────
          if (isTenantScoped && ctx?.tenantId) {
            if (READ_ACTIONS.has(operation)) {
              args = { ...args, where: { ...args?.where, tenantId: ctx.tenantId } };
            }
            if (operation === 'create') {
              args = { ...args, data: { ...args?.data, tenantId: ctx.tenantId } };
            }
            if (operation === 'createMany') {
              args = { ...args, data: (args?.data ?? []).map((d: any) => ({ ...d, tenantId: ctx.tenantId })) };
            }
            if (WRITE_ACTIONS.has(operation)) {
              args = { ...args, where: { ...args?.where, tenantId: ctx.tenantId } };
            }
          }

          return query(args);
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof buildExtendedClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: ExtendedPrismaClient;

  constructor() {
    this.client = buildExtendedClient();
  }

  // Expose Prisma operations via delegation
  get account() { return this.client.account; }
  get user() { return this.client.user; }
  get tenant() { return this.client.tenant; }
  get tenantUser() { return this.client.tenantUser; }
  get role() { return this.client.role; }
  get permission() { return this.client.permission; }
  get refreshToken() { return this.client.refreshToken; }
  get journalEntry() { return this.client.journalEntry; }
  get journalLine() { return this.client.journalLine; }
  get financialPeriod() { return this.client.financialPeriod; }
  get currency() { return this.client.currency; }
  get fxRate() { return this.client.fxRate; }
  get invoice() { return this.client.invoice; }
  get payment() { return this.client.payment; }
  get employee() { return this.client.employee; }
  get leaveRequest() { return this.client.leaveRequest; }
  get leaveBalance() { return this.client.leaveBalance; }
  get attendanceLog() { return this.client.attendanceLog; }
  get payrollRun() { return this.client.payrollRun; }
  get payslip() { return this.client.payslip; }
  get vendor() { return this.client.vendor; }
  get purchaseOrder() { return this.client.purchaseOrder; }
  get purchaseOrderLine() { return this.client.purchaseOrderLine; }
  get goodsReceipt() { return this.client.goodsReceipt; }
  get goodsReceiptLine() { return this.client.goodsReceiptLine; }
  get warehouse() { return this.client.warehouse; }
  get inventoryItem() { return this.client.inventoryItem; }
  get stockLevel() { return this.client.stockLevel; }
  get demandForecast() { return this.client.demandForecast; }
  get project() { return this.client.project; }
  get milestone() { return this.client.milestone; }
  get task() { return this.client.task; }
  get resourceAssignment() { return this.client.resourceAssignment; }
  get budget() { return this.client.budget; }
  get timesheet() { return this.client.timesheet; }
  get dashboard() { return this.client.dashboard; }
  get widget() { return this.client.widget; }
  get scheduledReport() { return this.client.scheduledReport; }
  get auditLog() { return this.client.auditLog; }
  get notification() { return this.client.notification; }
  get notificationPreference() { return this.client.notificationPreference; }
  get webhook() { return this.client.webhook; }
  get webhookDelivery() { return this.client.webhookDelivery; }

  // Transaction support
  $transaction(...args: Parameters<ExtendedPrismaClient['$transaction']>) {
    return (this.client.$transaction as any)(...args);
  }

  $queryRaw(...args: Parameters<ExtendedPrismaClient['$queryRaw']>) {
    return this.client.$queryRaw(...args);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    if (_pool) {
      await _pool.end();
      _pool = null;
    }
  }
}
