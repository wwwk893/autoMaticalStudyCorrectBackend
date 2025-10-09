import { Injectable, Logger } from '@nestjs/common';

import { redactPayload } from './redactor';

export interface AuditRecord {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly entries: AuditRecord[] = [];

  record(entry: Omit<AuditRecord, 'timestamp'>) {
    const sanitized = redactPayload(entry.payload);
    const record: AuditRecord = { ...entry, payload: sanitized, timestamp: new Date() };
    this.entries.push(record);
    this.logger.debug(`Audit ${record.action} on ${record.targetType}:${record.targetId}`);
  }

  findAll() {
    return [...this.entries];
  }
}
