import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PipelineWorkerModule } from './workers/pipeline-worker.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PipelineWorkerModule],
  providers: [Logger]
})
export class WorkerModule {}
