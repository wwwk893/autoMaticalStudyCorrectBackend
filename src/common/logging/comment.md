# Logging Utilities

Implements audit logging and sensitive data redaction helpers shared across services.

## Files
- **`audit-log.service.ts`**
  - Provides append-only audit records with trace identifiers, actor metadata, and operation names.
  - Supports soft-delete tracking by recording before/after snapshots without storing raw personal data.
- **`redactor.ts`**
  - Supplies helper functions that mask names, student numbers, and PII according to compliance requirements before logging.

## Best Practices
- Use `AuditLogService` when mutating tenant or submission state so operations can be reconstructed for compliance.
- Wrap log payloads with `redactSensitiveFields` before emitting to shared logging transports.
