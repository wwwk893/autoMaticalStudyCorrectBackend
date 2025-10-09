# Worker Pipeline Module

Implements the BullMQ worker responsible for orchestrating OCR, parsing, grading, and reporting stages.

## Files
- **`pipeline-worker.module.ts`**
  - Bootstraps the worker service, registering queue processors and telemetry exporters.
- **`pipeline-worker.service.ts`**
  - Consumes jobs from submission/import queues, applying deduplication plugins.
  - Emits stage-specific metrics (queued, ocr, parsed, graded, reported) for Prometheus and traces via OpenTelemetry.
  - Handles retries with exponential backoff and pushes exhausted jobs to the dead-letter queue (DLQ) while triggering alerts.

## Operational Considerations
- Configure Redis/queue names in environment variables to keep the worker aligned with API producers.
- Extend the service with new processors to support additional scoring strategies or import/export flows.
