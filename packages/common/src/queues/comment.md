# Shared Queue Contracts

Holds queue name constants and event typings shared by both API producers and worker consumers.

## Files
- **`queue.names.ts`**
  - Enumerates BullMQ queue identifiers (submissions, imports, content review) to eliminate magic strings across services.
- **`pipeline-events.ts`**
  - Declares TypeScript interfaces describing stage transitions (`queued`, `ocr`, `parsed`, `graded`, `reported`) with timing metadata.

## Implementation Notes
- Import these definitions whenever emitting or handling queue events to maintain type parity between API and worker packages.
- Extend the `PipelineStage` union before adding new telemetry checkpoints, ensuring metrics and dashboards stay consistent.
