import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { QUEUE_NAMES } from '@app/common/queues/queue.names';

@Injectable()
export class PipelineWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PipelineWorkerService.name);
  private readonly workers: Worker[] = [];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    const connection = { connection: { url: redisUrl } };

    this.workers.push(
      new Worker(
        QUEUE_NAMES.OCR,
        async (job) => {
          this.logger.log(`Processing OCR job ${job.id}`);
          return { ocrText: 'placeholder text', submissionId: job.data.submissionId };
        },
        connection
      )
    );

    this.workers.push(
      new Worker(
        QUEUE_NAMES.PARSE,
        async (job) => {
          this.logger.log(`Processing Parse job ${job.id}`);
          return { parseResult: 'placeholder parse', input: job.data };
        },
        connection
      )
    );

    this.workers.push(
      new Worker(
        QUEUE_NAMES.GRADE,
        async (job) => {
          this.logger.log(`Processing Grade job ${job.id}`);
          return { grade: 100, details: job.data };
        },
        connection
      )
    );

    this.workers.push(
      new Worker(
        QUEUE_NAMES.REPORT,
        async (job) => {
          this.logger.log(`Processing Report job ${job.id}`);
          return { reportUrl: `s3://reports/${job.data.submissionId}.json` };
        },
        connection
      )
    );

    this.logger.log('BullMQ workers registered for OCR, Parse, Grade, and Report queues');
  }

  async onModuleDestroy() {
    await Promise.all(this.workers.map((worker) => worker.close()));
  }
}
