import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MetricsService } from '../../../../src/observability/metrics.service';
import { SloService } from '../../../../src/observability/slo.service';

@ApiTags('observability')
@Controller()
export class ObservabilityController {
  constructor(private readonly metrics: MetricsService, private readonly slo: SloService) {}

  @Get('metrics')
  @Header('Content-Type', 'text/plain')
  async metricsEndpoint() {
    return this.metrics.dumpMetrics();
  }

  @Get('slo/budget')
  sloBudget() {
    return this.slo.getSnapshot();
  }
}
