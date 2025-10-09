# Submissions Module Notes

Coordinates intake of student submissions and routes them to the scoring pipeline.

## Files
- **`submissions.controller.ts`**
  - Accepts submission payloads (including attachments uploaded via presign flow) and returns queued job identifiers.
- **`submissions.service.ts`**
  - Validates submission metadata, triggers content safety checks, and enqueues grading tasks with idempotency keys based on `submissionId`.
  - Publishes stage events to the observability service for monitoring (queued → graded → reported).
- **`submissions.module.ts`**
  - Connects the service/controller with queue, scoring, and tenancy providers.

## Processing Lifecycle
1. Submission is received and deduplicated; duplicates short-circuit with the previously generated job id.
2. Queue worker processes scoring stages (OCR, parsing, grading).
3. Final status updates are emitted for clients via WebSocket or polling endpoints.
