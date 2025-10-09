export type PipelineStageEvent =
  | 'queued'
  | 'ocr'
  | 'parsed'
  | 'graded'
  | 'reported'
  | 'failed';

export interface PipelineEventPayload<T extends PipelineStageEvent = PipelineStageEvent> {
  submissionId: string;
  stage: T;
  at: string;
  meta?: Record<string, unknown>;
}
