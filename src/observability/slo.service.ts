import { Injectable } from '@nestjs/common';

import { MetricsService } from './metrics.service';

export interface SloBudgetState {
  window: string;
  targetP95Ms: number;
  currentP95Ms: number;
  failureRate: number;
  remainingBudget: number;
  status: 'healthy' | 'breaching';
}

@Injectable()
export class SloService {
  private state: SloBudgetState = {
    window: '24h',
    targetP95Ms: Number(process.env.SLO_P95_THRESHOLD_MS ?? 10000),
    currentP95Ms: 0,
    failureRate: 0,
    remainingBudget: 1,
    status: 'healthy'
  };

  constructor(private readonly metrics: MetricsService) {}

  evaluate(p95Ms: number, failureRate: number) {
    this.state.currentP95Ms = p95Ms;
    this.state.failureRate = failureRate;
    const targetFailure = Number(process.env.SLO_FAILURE_RATE_THRESHOLD ?? 0.01);
    const remaining = Math.max(0, 1 - failureRate / targetFailure);
    this.state.remainingBudget = remaining;
    this.state.status = p95Ms > this.state.targetP95Ms || failureRate > targetFailure ? 'breaching' : 'healthy';
    this.metrics.updateErrorBudget(remaining);
  }

  getSnapshot() {
    return this.state;
  }
}
