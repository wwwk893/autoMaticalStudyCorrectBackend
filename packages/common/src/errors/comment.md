# Shared Error Utilities

Defines reusable application error types and enumerations consumed across API and worker services.

## Files
- **`app-exception.ts`**
  - Extends JavaScript `Error` with structured fields (`code`, `httpStatus`, `metadata`) compatible with the global HTTP exception filter.
  - Generates a per-error `traceId` fallback when one is not provided upstream.
- **`error-codes.ts`**
  - Central enum of domain-specific error codes (auth, uploads, content safety, rate limiting) ensuring consistent responses between services.

## Usage Guidelines
- Throw `AppException` with the desired `ErrorCode` anywhere domain validation fails; the filter serializes it to `{ code, message, traceId }`.
- Keep all API/worker modules importing error codes from here to avoid divergence.
