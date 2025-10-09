import { Module } from '@nestjs/common';

import { MetricsService } from '../../../../src/observability/metrics.service';
import { SloService } from '../../../../src/observability/slo.service';
import { ObservabilityController } from './observability.controller';

@Module({
  controllers: [ObservabilityController],
  providers: [MetricsService, SloService],
  exports: [MetricsService, SloService]
})
export class ObservabilityModule {}
