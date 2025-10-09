# Reports Module Overview

Generates scorecards, analytics exports, and lecture summaries for classes and tenants.

## Components
- **`reports.controller.ts`**
  - Hosts endpoints for PDF/Excel exports including score distributions and knowledge radar charts.
  - Enforces rate limiting and content review before delegating to the service layer.
- **`reports.service.ts`**
  - Aggregates submission metrics, pulls error taxonomy data, and assembles export payloads.
  - Streams generated assets back to the client or uploads them to object storage for asynchronous download.
- **`reports.module.ts`**
  - Registers the service/controller duo and exposes providers for dependency injection in other modules.

## Workflow
1. Consumers request exports with tenant/teacher context.
2. Service computes insights (Top-N mistake reasons, distributions) using cached submission data.
3. Outputs are wrapped in DTOs compatible with both synchronous download and background generation pipelines.
