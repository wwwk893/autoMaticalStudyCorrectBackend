# Quota Guard Module

This directory contains guard implementations that enforce per-teacher and per-tenant quotas on HTTP requests.

## Key Components
- **`QuotaGuard`** (`quota.guard.ts`)
  - Maintains an in-memory `Map` keyed by `tenantId:teacherId` to track request counts within a rolling window.
  - Resets counters after `windowMs` (1 second) and rejects requests above the configured `limit` (200 requests/s) by raising `AppException` with `RATE_LIMIT_EXCEEDED`.
  - Reads identifiers from the `x-tenant-id` and `x-teacher-id` headers and attaches trace-friendly errors for uniform handling.

## Usage Notes
- Apply `QuotaGuard` to controllers that must be protected against abuse while supporting tenant-aware throttling.
- The guard relies on the global exception filter to translate `AppException` into `{ code, message, traceId }` responses.
