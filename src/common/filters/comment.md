# HTTP Filters

Centralizes NestJS exception filters that normalize API responses and attach trace metadata.

## Files
- **`http-exception.filter.ts`**
  - Catches thrown `AppException` instances and constructs the `{ code, message, traceId }` payload mandated by the contract.
  - Fallbacks to generic error handling while still generating a trace identifier for unexpected exceptions.
  - Logs errors with redacted context via the shared logging utilities.

## Usage
- Registered globally in `main.ts` so every controller benefits from uniform error envelopes.
- Extend the filter with additional serialization logic when introducing new domain-specific error types.
