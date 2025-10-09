# Scoring Strategies

Concrete implementations of `IScoringStrategy` covering the supported subject types.

## Files
- **`scoring-strategy.interface.ts`**
  - Defines the required `score(answer, key, options)` signature and response contract (`score`, `why[]`, `normalizedAnswer`).
- **`chinese-short-answer.strategy.ts`**
  - Normalizes answers via synonym tables and punctuation trimming before computing semantic similarity.
  - Populates `why[]` with matched keywords to provide explainability to teachers.
- **`english-fill-blank.strategy.ts`**
  - Supports configurable case sensitivity and punctuation handling; compares normalized tokens to answer keys.
- **`math-expr.strategy.ts`**
  - Simplifies mathematical expressions (optionally via SymPy integration) and checks algebraic equivalence beyond text matches.

## Implementation Guidance
- Each strategy should remain stateless and pure to simplify unit testing and worker reuse.
- When adding new strategies, ensure they return both raw scores and human-readable rationales for reporting modules.
