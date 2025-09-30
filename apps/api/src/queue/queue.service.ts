import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

import { QueueName, QUEUE_NAMES } from '@app/common/queues/queue.names';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly redisUrl: string;
  readonly queues: Record<QueueName, Queue>;

  constructor(private readonly configService: ConfigService) {
    this.redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.queues = {
      [QUEUE_NAMES.OCR]: this.createQueue(QUEUE_NAMES.OCR),
      [QUEUE_NAMES.PARSE]: this.createQueue(QUEUE_NAMES.PARSE),
      [QUEUE_NAMES.GRADE]: this.createQueue(QUEUE_NAMES.GRADE),
      [QUEUE_NAMES.REPORT]: this.createQueue(QUEUE_NAMES.REPORT)
    } as Record<QueueName, Queue>;
  }

  getQueue(name: QueueName) {
    return this.queues[name];
  }

  private createQueue(name: QueueName) {
    return new Queue(name, { connection: { url: this.redisUrl } });
  }

  async onModuleDestroy() {
    await Promise.all(Object.values(this.queues).map((queue) => queue.close()));
  }
}
