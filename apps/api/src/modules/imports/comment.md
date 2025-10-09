# Imports Module Summary

Implements the roster import workflow and queues long-running parsing jobs.

## Components
- **`imports.controller.ts`**
  - Exposes `POST /imports/roster` accepting CSV/Excel metadata and guards requests with quota & content safety checks.
- **`imports.service.ts`**
  - Logs enqueue attempts and pushes import tasks onto the BullMQ queue via `QueueService.enqueue`, using the file key as the idempotency key.
- **`dto/roster-import.dto.ts`**
  - Validates tenant, teacher, and upload metadata (file key, content type, size) before any background processing happens.

## Execution Flow
1. Client uploads roster file using the uploads module and obtains a storage `fileKey`.
2. Controller receives import request, delegates to `ImportsService.enqueueRosterImport`.
3. Worker consumes the queued job to parse & persist roster entries while the API responds synchronously with `{ queued: true }`.
