# Observability Services

Utility services for metrics collection and service level objective tracking.

## Files
- **`metrics.service.ts`**
  - Wraps Prometheus client collectors to emit histograms and counters for each pipeline stage.
  - Provides helper methods to time operations (`startTimer`/`observe`) ensuring consistent label sets.
- **`slo.service.ts`**
  - Tracks success/failure rates against defined SLOs (e.g., P95 < 10s, failure < 1%).
  - Raises alerts when error budgets are exhausted or latency thresholds are breached.

## Usage
- Inject `MetricsService` into API controllers and workers to record processing durations and payload sizes.
- Leverage `SloService` hooks to integrate with alerting systems (PagerDuty, DingTalk) when SLO violations occur.
