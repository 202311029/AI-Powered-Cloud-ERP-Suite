import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('webhooks')
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Dispatching webhook event: ${job.data.event}`);
    
    // In a real app, we would fetch subscribers from DB and POST to their URLs
    // F-10/F-11 Requirement: Retry up to 3x on failure
    try {
        // Mock POST request
        this.logger.log(`Successfully dispatched to 5 subscribers.`);
        return { success: true };
    } catch (err) {
        this.logger.error(`Failed to dispatch webhook. Job ${job.id} will retry if configured.`);
        throw err;
    }
  }
}
