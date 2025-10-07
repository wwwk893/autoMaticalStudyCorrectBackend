import { Module } from '@nestjs/common';

import { QueueModule } from '../queue/queue.module';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  imports: [QueueModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService]
})
export class SubmissionsModule {}
