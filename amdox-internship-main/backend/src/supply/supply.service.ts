import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, tenantContext } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SupplyService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private audit: AuditService,
  ) {}

  // ─── Vendors ──────────────────────────────────────────────────────────────
  async getVendors(isActive?: boolean) {
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    return this.prisma.vendor.findMany({ where, orderBy: { name: 'asc' } });
  }

  async createVendor(data: any, userId: string) {
    const ctx = tenantContext.getStore()!;
    const vendor = await this.prisma.vendor.create({ data: { ...data, tenantId: ctx.tenantId } });
    await this.audit.createLog({ action: 'VENDOR_CREATED', entity: 'Vendor', entityId: vendor.id, userId, tenantId: ctx.tenantId });
    return vendor;
  }

  // ─── Purchase Orders ──────────────────────────────────────────────────────
  async getPurchaseOrders(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: { select: { id: true, name: true } },
        lines: { include: { inventoryItem: { select: { sku: true, name: true } } } },
        _count: { select: { goodsReceipts: true, invoices: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createPurchaseOrder(data: any, userId: string) {
    const ctx = tenantContext.getStore()!;
    const po = await this.prisma.purchaseOrder.create({
      data: {
        poNumber: data.poNumber,
        vendorId: data.vendorId,
        currency: data.currency || 'INR',
        totalAmount: data.totalAmount || 0,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
        notes: data.notes,
        tenantId: ctx.tenantId,
        createdBy: userId,
      },
    });

    if (data.lines?.length) {
      await this.prisma.purchaseOrderLine.createMany({
        data: data.lines.map((l: any) => ({
          purchaseOrderId: po.id,
          inventoryItemId: l.inventoryItemId,
          description: l.description,
          sku: l.sku,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          totalPrice: l.quantity * l.unitPrice,
        })),
      });
    }

    await this.audit.createLog({ action: 'PO_CREATED', entity: 'PurchaseOrder', entityId: po.id, userId, tenantId: ctx.tenantId });
    return this.prisma.purchaseOrder.findUnique({ where: { id: po.id }, include: { lines: true, vendor: true } });
  }

  async approvePO(id: string, userId: string) {
    const ctx = tenantContext.getStore()!;
    const po = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'Approved', approvedBy: userId, approvedAt: new Date() },
    });
    await this.audit.createLog({ action: 'PO_APPROVED', entity: 'PurchaseOrder', entityId: id, userId, tenantId: ctx.tenantId });
    return po;
  }

  // ─── Inventory ────────────────────────────────────────────────────────────
  async getInventory(category?: string) {
    const where: any = {};
    if (category) where.category = category;
    return this.prisma.inventoryItem.findMany({
      where,
      include: {
        stockLevels: { include: { warehouse: { select: { code: true, name: true } } } },
      },
      orderBy: { sku: 'asc' },
    });
  }

  async getLowStockItems() {
    const items = await this.prisma.inventoryItem.findMany({
      include: { stockLevels: true },
    });
    return items.filter(item => {
      const totalStock = item.stockLevels.reduce((s, sl) => s + sl.quantity, 0);
      return totalStock <= item.reorderLevel;
    }).map(item => ({
      ...item,
      totalStock: item.stockLevels.reduce((s, sl) => s + sl.quantity, 0),
    }));
  }

  async createInventoryItem(data: any, userId: string) {
    const ctx = tenantContext.getStore()!;
    const item = await this.prisma.inventoryItem.create({ data: { ...data, tenantId: ctx.tenantId } });
    await this.audit.createLog({ action: 'ITEM_CREATED', entity: 'InventoryItem', entityId: item.id, userId, tenantId: ctx.tenantId });
    return item;
  }

  // ─── Warehouses ───────────────────────────────────────────────────────────
  async getWarehouses() {
    return this.prisma.warehouse.findMany({
      include: { _count: { select: { stockLevels: true } } },
    });
  }

  // ─── Goods Receipts ───────────────────────────────────────────────────────
  async createGoodsReceipt(data: any, userId: string) {
    const ctx = tenantContext.getStore()!;
    const gr = await this.prisma.goodsReceipt.create({
      data: {
        grNumber: data.grNumber,
        purchaseOrderId: data.purchaseOrderId,
        receivedBy: userId,
        notes: data.notes,
        tenantId: ctx.tenantId,
      },
    });

    if (data.lines?.length) {
      for (const line of data.lines) {
        await this.prisma.goodsReceiptLine.create({
          data: {
            goodsReceiptId: gr.id,
            inventoryItemId: line.inventoryItemId,
            sku: line.sku,
            description: line.description,
            orderedQty: line.orderedQty,
            receivedQty: line.receivedQty,
            warehouseId: line.warehouseId,
          },
        });
        // Update stock level
        if (line.inventoryItemId && line.warehouseId) {
          await this.prisma.stockLevel.upsert({
            where: { inventoryItemId_warehouseId: { inventoryItemId: line.inventoryItemId, warehouseId: line.warehouseId } },
            update: { quantity: { increment: line.receivedQty } },
            create: { inventoryItemId: line.inventoryItemId, warehouseId: line.warehouseId, quantity: line.receivedQty },
          });
        }
      }
    }

    await this.audit.createLog({ action: 'GR_CREATED', entity: 'GoodsReceipt', entityId: gr.id, userId, tenantId: ctx.tenantId });
    return gr;
  }

  // ─── AI Forecast (proxy to ML service) ────────────────────────────────────
  async getDemandForecasts(itemId?: string) {
    const where: any = {};
    if (itemId) where.inventoryItemId = itemId;
    return this.prisma.demandForecast.findMany({
      where,
      include: { inventoryItem: { select: { sku: true, name: true } } },
      orderBy: { forecastDate: 'asc' },
    });
  }

  async triggerForecast(itemId: string) {
    try {
      const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
      const res = await firstValueFrom(this.http.post(`${mlUrl}/predict`, { item_id: itemId }));
      return res.data;
    } catch {
      return { error: 'ML service unavailable', fallback: true };
    }
  }
}
