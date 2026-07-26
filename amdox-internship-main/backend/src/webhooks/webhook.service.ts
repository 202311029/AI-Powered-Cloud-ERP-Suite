import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(
    @InjectQueue('webhooks') private webhookQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async subscribe(url: string, event: string, tenantId: string) {
    // F-11: Outbound webhook subscriptions
    return (this.prisma as any).webhookSubscription.create({
      data: { url, event, tenantId, isActive: true }
    });
  }

  async trigger(event: string, payload: any) {
    await this.webhookQueue.add('dispatch-webhook', { event, payload, timestamp: new Date() });
  }
}
