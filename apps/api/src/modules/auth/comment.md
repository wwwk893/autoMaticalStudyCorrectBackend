# Auth Module Notes

This module exposes tenant-aware authentication flows tailored for WeChat Mini Program logins.

## Files
- **`auth.controller.ts`**
  - Declares `POST /auth/weapp/login` endpoint and funnels each request through rate limiting and trace-aware exception handling.
- **`auth.service.ts`**
  - Validates teacher/tenant ownership via `TenancyService` before performing the pseudo `code2Session` exchange.
  - Detects existing bindings both at the tenancy level (`findTeacherByOpenId`) and in-memory session cache to guarantee idempotency.
  - Generates signed session payloads with `accessToken`, TTL, and the originating `traceId` for downstream correlation.
- **`dto/weapp-login.dto.ts`**
  - Captures the `code`, `teacherId`, and optional `tenantId` with class-validator decorators to enforce payload shape.

## Integration Flow
1. Controller accepts validated DTO and retrieves `traceId` from the request context.
2. `AuthService.weappLogin` exchanges the code for an OpenID/UnionID pair, ensuring the WeChat account is uniquely bound.
3. Successful logins return a token bundle that other modules use for auditing and rate limiting.
