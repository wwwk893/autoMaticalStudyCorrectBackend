export const QUEUE_NAMES = {
  OCR: 'ocr',
  PARSE: 'parse',
  GRADE: 'grade',
  REPORT: 'report',
  IMPORTS: 'imports',
  DEAD_LETTER: 'pipeline-dlq'
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
