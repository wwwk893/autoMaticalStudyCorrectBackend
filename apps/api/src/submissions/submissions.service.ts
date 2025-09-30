import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';

import { CreateSubmissionDto } from '@app/common/dto/create-submission.dto';
import { SubmissionStatusDto } from '@app/common/dto/submission-status.dto';
import { QUEUE_NAMES } from '@app/common/queues/queue.names';

import { QueueService } from '../queue/queue.service';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);
  private readonly statusStore = new Map<string, SubmissionStatusDto>();

  constructor(private readonly queueService: QueueService) {}

  async create(dto: CreateSubmissionDto) {
    const id = nanoid();
    const status: SubmissionStatusDto = {
      id,
      status: 'queued',
      receivedAt: new Date().toISOString(),
      payload: dto
    };
    this.statusStore.set(id, status);

    const queue = this.queueService.getQueue(QUEUE_NAMES.OCR);
    await queue.add('submission', { submissionId: id, images: dto.images });
    this.logger.log(`Submission ${id} enqueued to ${QUEUE_NAMES.OCR}`);

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
