# Scoring Module Overview

Provides the abstraction layer for pluggable scoring strategies used across different subject types.

## Files
- **`index.ts`**
  - Exports the `IScoringStrategy` interface and concrete strategy classes for module consumers.
- **`strategies/`**
  - Houses specific scoring implementations (Chinese short answers, English fill-in-the-blank, math expressions).

## Extension Points
- Register new strategy classes here and expose them through `index.ts` to make them available to API services and workers.
- Strategies should return `{ score, why[], normalizedAnswer }` objects to remain compatible with reporting and explanations.
