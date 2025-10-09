# Queue Module Description

Provides a thin abstraction over BullMQ queues for deduplicated job submission and monitoring hooks.

## Core Files
- **`queue.service.ts`**
  - Wraps BullMQ clients to enqueue jobs with idempotency keys derived from submission identifiers or file keys.
  - Applies exponential backoff, timeout policies, and dead-letter routing to ensure reliability requirements are met.
  - Emits instrumentation events for observability (queued → reported states).
- **`queue.module.ts`**
  - Configures BullMQ connections (Redis URL from environment) and exports the service to both API modules and worker processes.

## Usage Pattern
- Inject `QueueService` in modules (imports, submissions) and call `enqueue(queueName, jobId, payload)`.
- Customize retry/timeout behaviour by extending service methods before adding new queue types.
