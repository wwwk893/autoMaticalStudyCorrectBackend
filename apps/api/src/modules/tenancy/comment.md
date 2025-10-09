# Tenancy Module Summary

Manages multi-tenant isolation, teacher lifecycle, and WeChat account bindings used by the auth pipeline.

## Files
- **`tenancy.service.ts`**
  - Maintains in-memory maps of tenants and teachers with full auditing fields (`createdBy`, `updatedBy`, timestamps).
  - Provides helper methods to upsert tenants, create teachers, and bind WeChat OpenIDs while recording mutation actors.
  - Exposes lookup helpers (`findTeacherById`, `findTeacherByOpenId`) consumed by auth & quota layers.
- **`entities/tenant.entity.ts`** & **`entities/teacher.entity.ts`**
  - Define lightweight TypeScript interfaces modelling persistence columns, including audit metadata and soft delete hooks.
- **`tenancy.module.ts`**
  - Registers the service as a provider so other modules (auth, uploads, reports) can inject tenancy context.

## Usage
- Call `upsertTenant` during provisioning or seed scripts to ensure consistent IDs before teacher onboarding.
- Use the `findTeacher*` helpers to enforce per-tenant authorization across controllers.
