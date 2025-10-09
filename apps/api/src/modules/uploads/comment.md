# Uploads Module Documentation

Handles presigned upload workflows, whitelist validation, and callback verification for object storage providers.

## File Guide
- **`uploads.controller.ts`**
  - Offers endpoints to request presigned URLs and to receive storage callbacks.
  - Applies content-safety scanning to metadata before delegating to the service layer.
- **`uploads.service.ts`**
  - Validates MIME types, file sizes, and optional page counts against configurable limits.
  - Generates short-lived presign tokens for S3/OSS/COS compatible buckets and stores TTL metadata.
  - Verifies callback signatures, ensuring timestamps fall within the replay window before acknowledging completion.
- **`dto/presign-request.dto.ts`** & **`dto/upload-callback.dto.ts`**
  - Define validation schemas for upload requests and provider callbacks, capturing tenant, teacher, and file details.

## Flow Summary
1. Client requests a presigned upload URL with expected file properties.
2. Service checks whitelist limits, raises `AppException` on violations, and returns signed upload instructions.
3. Storage provider calls back with signature & timestamp; service re-validates and finalizes the upload record.
