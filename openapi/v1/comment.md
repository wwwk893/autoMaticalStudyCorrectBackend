# OpenAPI Contract

Contains the versioned OpenAPI 3.1 specification describing REST endpoints and WebSocket events.

## Files
- **`openapi.yaml`**
  - Documents authentication flows, uploads, submissions, reporting, and WebSocket event schema.
  - Used by frontend tooling to generate typed clients; keep backwards compatibility when evolving endpoints.

## Maintenance
- Update this file whenever API or event payloads change and regenerate client SDKs via CI tooling.
- Increment the directory version (e.g., `v2`) when introducing breaking changes to allow consumers to transition.
