import { Injectable, Logger } from '@nestjs/common';

import { QUEUE_NAMES } from '@app/common';

import { QueueService } from '../../queue/queue.service';
import { RosterImportDto } from './dto/roster-import.dto';

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);

  constructor(private readonly queueService: QueueService) {}

  async enqueueRosterImport(dto: RosterImportDto) {
    this.logger.log(`Enqueue roster import ${dto.fileKey}`);
    await this.queueService.enqueue(QUEUE_NAMES.IMPORTS, dto.fileKey, dto);
    return { queued: true };
  }
}
