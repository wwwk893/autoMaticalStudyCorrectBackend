import { Module } from '@nestjs/common';

import { QueueModule } from '../queue/queue.module';
import { ObservabilityModule } from '../modules/observability/observability.module';
import { QuotaGuard } from '../common/guards/quota.guard';
import { ContentSafetyService } from '../common/services/content-safety.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { AuditLogService } from '../../../src/common/logging/audit-log.service';

@Module({
  imports: [QueueModule, ObservabilityModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, QuotaGuard, ContentSafetyService, AuditLogService]
})
export class SubmissionsModule {}
