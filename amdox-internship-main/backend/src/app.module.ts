import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';

// Core
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

// Feature modules
import { FinanceModule } from './finance/finance.module';
import { HrModule } from './hr/hr.module';
import { SupplyModule } from './supply/supply.module';
import { ProjectsModule } from './projects/projects.module';
import { BiModule } from './bi/bi.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebhooksModule } from './webhooks/webhooks.module';

// Common
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    // ─── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ─── Rate limiting (F-11): 100 req/min per IP via Valkey ────────────────
    ThrottlerModule.forRoot([{
      ttl: 60000,    // 60 seconds window
      limit: 100,    // 100 requests per window
    }]),

    // ─── Event bus for domain events (F-10) ──────────────────────────────────
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),

    // ─── BullMQ job queues backed by Valkey ──────────────────────────────────
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        enableOfflineQueue: false,
        lazyConnect: true,
      },
    }),

    // ─── HTTP client for ML service + FX rates ───────────────────────────────
    HttpModule,

    // ─── Core modules ────────────────────────────────────────────────────────
    PrismaModule,
    AuthModule,

    // ─── Feature modules ─────────────────────────────────────────────────────
    FinanceModule,
    HrModule,
    SupplyModule,
    ProjectsModule,
    BiModule,
    AuditModule,
    NotificationsModule,
    WebhooksModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
