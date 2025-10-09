export interface ScoringResult {
  score: number;
  normalizedAnswer: string;
  why: string[];
}

export interface ScoringContext {
  maxScore: number;
  answerKey: unknown;
  locale?: string;
}

export interface IScoringStrategy {
  name: string;
  score(answer: string, context: ScoringContext): Promise<ScoringResult>;
}
