import { Module } from '@nestjs/common';

import { QueueModule } from '../../queue/queue.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [QueueModule],
  controllers: [ImportsController],
  providers: [ImportsService]
})
export class ImportsModule {}
