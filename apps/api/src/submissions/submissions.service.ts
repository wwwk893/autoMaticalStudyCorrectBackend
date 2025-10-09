import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';

import { AppException, CreateSubmissionDto, ErrorCode, SubmissionStatusDto, QUEUE_NAMES } from '@app/common';
import { MetricsService, PipelineStage } from '../../../src/observability/metrics.service';

import { AuditLogService } from '../../../src/common/logging/audit-log.service';
import { ContentSafetyService } from '../common/services/content-safety.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);
  private readonly statusStore = new Map<string, SubmissionStatusDto>();
  private readonly stageTimestamps = new Map<string, Record<PipelineStage, number>>();

  constructor(
    private readonly queueService: QueueService,
    private readonly metrics: MetricsService,
    private readonly contentSafety: ContentSafetyService,
    private readonly auditLog: AuditLogService
  ) {}

  async create(dto: CreateSubmissionDto) {
    const id = dto.submissionId ?? nanoid();
    if (this.statusStore.has(id)) {
      throw new AppException(ErrorCode.SUBMISSION_DUPLICATED, 'Submission already exists', 409);
    }
    this.contentSafety.scan(dto.assignmentId, id);
    const status: SubmissionStatusDto = {
      id,
      status: 'queued',
      receivedAt: new Date().toISOString(),
      payload: dto
    };
    this.statusStore.set(id, status);
    this.stageTimestamps.set(id, { [PipelineStage.QUEUED]: Date.now() } as Record<PipelineStage, number>);

    await this.queueService.enqueue(QUEUE_NAMES.OCR, id, { submissionId: id, images: dto.images });
    this.logger.log(`Submission ${id} enqueued to ${QUEUE_NAMES.OCR}`);
    this.metrics.recordStageDuration(PipelineStage.QUEUED, 0);
    this.auditLog.record({
      actorId: dto.studentId,
      action: 'submission.create',
      targetType: 'submission',
      targetId: id,
      payload: { assignmentId: dto.assignmentId, subject: dto.subject ?? 'unknown' }
    });

    return status;
  }

  async getStatus(id: string) {
    return (
      this.statusStore.get(id) ?? {
        id,
        status: 'unknown',
        receivedAt: null,
        payload: null
      }
    );
  }
}
