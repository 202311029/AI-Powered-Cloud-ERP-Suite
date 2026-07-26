import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

interface CreateAuditLogParams {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  tenantId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async createLog(params: CreateAuditLogParams) {
    // Get previous hash for chain integrity
    const lastLog = await this.prisma.auditLog.findFirst({
      where: { tenantId: params.tenantId },
      orderBy: { createdAt: 'desc' },
      select: { hash: true },
    });

    const previousHash = lastLog?.hash || '0';
    const hashInput = `${params.action}|${params.entity}|${params.entityId}|${params.userId}|${JSON.stringify(params.changes || {})}|${previousHash}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

    return this.prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        userId: params.userId,
        tenantId: params.tenantId,
        changes: params.changes,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        previousHash,
        hash,
      },
    });
  }

  async getLogs(filters: { entity?: string; action?: string; userId?: string; from?: string; to?: string }) {
    const where: any = {};
    if (filters.entity) where.entity = filters.entity;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }

    return this.prisma.auditLog.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async verifyIntegrity(tenantId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });

    let valid = true;
    let brokenAt: string | null = null;

    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1];
      const curr = logs[i];
      if (curr.previousHash !== prev.hash) {
        valid = false;
        brokenAt = curr.id;
        break;
      }
    }

    return { valid, totalLogs: logs.length, brokenAt };
  }
}
