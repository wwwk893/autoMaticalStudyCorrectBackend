import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

import { AppException, ErrorCode, QueueName, QUEUE_NAMES } from '@app/common';

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
      [QUEUE_NAMES.REPORT]: this.createQueue(QUEUE_NAMES.REPORT),
      [QUEUE_NAMES.IMPORTS]: this.createQueue(QUEUE_NAMES.IMPORTS),
      [QUEUE_NAMES.DEAD_LETTER]: this.createQueue(QUEUE_NAMES.DEAD_LETTER)
    } as Record<QueueName, Queue>;
  }

  getQueue(name: QueueName) {
    return this.queues[name];
  }

  private createQueue(name: QueueName) {
    return new Queue(name, {
      connection: { url: this.redisUrl },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
        timeout: 60_000
      }
    });
  }

  async enqueue(queueName: QueueName | string, idempotencyKey: string, payload: unknown) {
    const queue = this.queues[queueName as QueueName];
    if (!queue) {
      throw new AppException(ErrorCode.UNEXPECTED, `Queue ${queueName} not registered`);
    }
    const existing = await queue.getJob(idempotencyKey);
    if (existing) {
      throw new AppException(ErrorCode.SUBMISSION_DUPLICATED, 'Job already queued', 409);
    }
    await queue.add('job', payload, { jobId: idempotencyKey });
  }

  async onModuleDestroy() {
    await Promise.all(Object.values(this.queues).map((queue) => queue.close()));
  }
}
