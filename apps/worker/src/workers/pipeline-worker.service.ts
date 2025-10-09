import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';

import { QUEUE_NAMES } from '@app/common';
import { MetricsService, PipelineStage } from '../../../src/observability/metrics.service';
import { SloService } from '../../../src/observability/slo.service';
import {
  ChineseShortAnswerStrategy,
  EnglishFillBlankStrategy,
  IScoringStrategy,
  MathExpressionStrategy
} from '../../../src/modules/scoring';

@Injectable()
export class PipelineWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PipelineWorkerService.name);
  private readonly workers: Worker[] = [];
  private deadLetterQueue!: Queue;
  private readonly strategies: Record<string, IScoringStrategy> = {
    zh: new ChineseShortAnswerStrategy(),
    en: new EnglishFillBlankStrategy(),
    math: new MathExpressionStrategy()
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly metrics: MetricsService,
    private readonly slo: SloService
  ) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    const concurrency = Number(this.configService.get<number>('WORKER_CONCURRENCY') ?? 2);
    const connection = { connection: { url: redisUrl } };
    this.deadLetterQueue = new Queue(QUEUE_NAMES.DEAD_LETTER, connection);
    const parseQueue = new Queue(QUEUE_NAMES.PARSE, connection);
    const gradeQueue = new Queue(QUEUE_NAMES.GRADE, connection);
    const reportQueue = new Queue(QUEUE_NAMES.REPORT, connection);

    this.registerWorker(
      QUEUE_NAMES.OCR,
      PipelineStage.OCR,
      async (job) => {
        this.logger.log(`Processing OCR job ${job.id}`);
        return { submissionId: job.data.submissionId, ocrText: 'placeholder text' };
      },
      parseQueue,
      concurrency,
      connection
    );

    this.registerWorker(
      QUEUE_NAMES.PARSE,
      PipelineStage.PARSED,
      async (job) => {
        this.logger.log(`Processing Parse job ${job.id}`);
        return { submissionId: job.data.submissionId, parsedItems: [{ answer: '答案' }] };
      },
      gradeQueue,
      concurrency,
      connection
    );

    this.registerWorker(
      QUEUE_NAMES.GRADE,
      PipelineStage.GRADED,
      async (job) => {
        this.logger.log(`Processing Grade job ${job.id}`);
        const strategy = this.strategies[job.data.subject ?? 'zh'] ?? this.strategies.zh;
        const result = await strategy.score('示例回答', { maxScore: 100, answerKey: { lines: ['示例回答'] } });
        return { submissionId: job.data.submissionId, grade: result.score, explain: result.why };
      },
      reportQueue,
      concurrency,
      connection
    );

    this.registerWorker(
      QUEUE_NAMES.REPORT,
      PipelineStage.REPORTED,
      async (job) => {
        this.logger.log(`Processing Report job ${job.id}`);
        return { submissionId: job.data.submissionId, reportUrl: `s3://reports/${job.data.submissionId}.json` };
      },
      undefined,
      concurrency,
      connection
    );

    this.logger.log('BullMQ workers registered with reliability instrumentation');
  }

  async onModuleDestroy() {
    await Promise.all(this.workers.map((worker) => worker.close()));
    if (this.deadLetterQueue) {
      await this.deadLetterQueue.close();
    }
  }

  private registerWorker(
    queueName: string,
    stage: PipelineStage,
    processor: (job: Job) => Promise<Record<string, unknown>>,
    nextQueue: Queue | undefined,
    concurrency: number,
    connection: { connection: { url: string } }
  ) {
    const worker = new Worker(
      queueName,
      async (job) => {
        const started = Date.now();
        try {
          const result = await processor(job);
          const durationSeconds = (Date.now() - started) / 1000;
          this.metrics.recordStageDuration(stage, durationSeconds);
          if (nextQueue) {
            await nextQueue.add('job', { ...job.data, ...result }, { jobId: job.data.submissionId });
          }
          if (stage === PipelineStage.REPORTED) {
            this.slo.evaluate(durationSeconds * 1000, 0);
          }
          return result;
        } catch (error) {
          this.metrics.recordStageFailure(stage);
          if (stage === PipelineStage.REPORTED) {
            this.slo.evaluate(0, 1);
          }
          throw error;
        }
      },
      { ...connection, concurrency }
    );

    worker.on('failed', async (job, error) => {
      this.logger.error(`Job ${job?.id} failed on ${queueName}: ${error?.message}`);
      if (job) {
        await this.deadLetterQueue.add(
          `${queueName}-failed`,
          { submissionId: job.data.submissionId, error: error?.message, stage },
          { jobId: `${job.id}-${Date.now()}` }
        );
      }
    });

    worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed on ${queueName}`);
    });

    this.workers.push(worker);
  }
}
