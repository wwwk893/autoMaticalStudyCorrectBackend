# Shared DTO Definitions

Contains cross-application data transfer objects describing submissions and their metadata.

## Files
- **`create-submission.dto.ts`**
  - Shapes the payload required to enqueue grading requests (student identifiers, attachments, strategy hints).
  - Enforces validation rules that mirror API contracts so workers can rely on typed inputs.
- **`submission-metadata.dto.ts`** & **`submission-status.dto.ts`**
  - Capture derived state about submissions for reporting and progress updates (scores, normalized answers, stage timestamps).

## Usage Tips
- Import DTOs within both API controllers and worker processors to stay aligned with the OpenAPI schema.
- Extend DTOs instead of redefining interfaces when adding new scoring strategies or export requirements.
