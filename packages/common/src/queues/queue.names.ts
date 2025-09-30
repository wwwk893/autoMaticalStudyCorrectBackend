export const QUEUE_NAMES = {
  OCR: 'ocr',
  PARSE: 'parse',
  GRADE: 'grade',
  REPORT: 'report'
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
