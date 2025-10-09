# Observability Module

Surface runtime metrics and tracing health endpoints that power Grafana dashboards.

## Files
- **`observability.controller.ts`**
  - Provides lightweight HTTP endpoints for Prometheus scraping and OTLP exporter checks.
  - Decorated for future extension with authentication or IP allow lists.
- **`observability.module.ts`**
  - Wires the controller into the Nest app and exports providers required by other modules.

## Operational Notes
- Ensure Prometheus scrapes the `/observability/metrics` endpoint to populate latency histograms (queued→reported stages).
- Controllers can be extended with additional gauges or heartbeat endpoints without affecting core business modules.
