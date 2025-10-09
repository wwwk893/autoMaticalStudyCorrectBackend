# Content Safety Services

This directory hosts reusable service classes that provide infrastructure concerns for the API.

## Key Components
- **`ContentSafetyService`** (`content-safety.service.ts`)
  - Maintains a small keyword list and scans inbound text payloads before processing uploads or submissions.
  - Emits a structured warning with the `traceId` for auditing when content is rejected.
  - Throws an `AppException` with `CONTENT_SAFETY_BLOCKED` so the global error filter returns a standardized `{ code, message, traceId }` response.

## Integration Tips
- Invoke `scan` before persisting user-generated text or before enqueuing background work to ensure policy compliance.
- Extend `bannedKeywords` or swap the implementation to call an external moderation provider without altering consumers.
