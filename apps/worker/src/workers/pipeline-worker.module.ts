import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetricsService } from '../../../src/observability/metrics.service';
import { SloService } from '../../../src/observability/slo.service';
import { PipelineWorkerService } from './pipeline-worker.service';

@Module({
  imports: [ConfigModule],
  providers: [PipelineWorkerService, MetricsService, SloService]
})
export class PipelineWorkerModule {}
