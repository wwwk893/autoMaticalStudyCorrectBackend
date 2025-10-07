import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QueueModule, HealthModule, SubmissionsModule]
})
export class AppModule {}
