import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from 'prom-client';

export enum PipelineStage {
  QUEUED = 'queued',
  OCR = 'ocr',
  PARSED = 'parsed',
  GRADED = 'graded',
  REPORTED = 'reported'
}

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly stageDuration: Histogram<string>;
  private readonly stageFailures: Counter<string>;
  private readonly stageProcessed: Counter<string>;
  private readonly uploadSize: Histogram<string>;
  private readonly errorBudgetGauge: Gauge<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });
    this.stageDuration = new Histogram({
      name: 'pipeline_stage_duration',
      help: 'Duration of pipeline stages in seconds',
      labelNames: ['stage'],
      buckets: [0.5, 1, 2, 5, 10, 20]
    });
    this.stageFailures = new Counter({
      name: 'pipeline_stage_failures_total',
      help: 'Pipeline stage failures',
      labelNames: ['stage']
    });
    this.stageProcessed = new Counter({
      name: 'pipeline_stage_processed_total',
      help: 'Pipeline stage processed',
      labelNames: ['stage']
    });
    this.uploadSize = new Histogram({
      name: 'upload_asset_size',
      help: 'Uploaded asset sizes in bytes',
      buckets: [1024, 1024 * 100, 1024 * 500, 1024 * 1024, 1024 * 1024 * 5]
    });
    this.errorBudgetGauge = new Gauge({
      name: 'slo_error_budget_remaining',
      help: 'Remaining error budget ratio'
    });
  }

  recordStageDuration(stage: PipelineStage, seconds: number) {
    this.stageDuration.labels(stage).observe(seconds);
    this.stageProcessed.labels(stage).inc();
  }

  recordStageFailure(stage: PipelineStage) {
    this.stageFailures.labels(stage).inc();
  }

  recordUploadSize(bytes: number) {
    this.uploadSize.observe(bytes);
  }

  updateErrorBudget(ratio: number) {
    this.errorBudgetGauge.set(ratio);
  }

  async dumpMetrics() {
    return this.registry.metrics();
  }
}
