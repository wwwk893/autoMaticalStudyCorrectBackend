import { Module } from '@nestjs/common';

import { PipelineWorkerService } from './pipeline-worker.service';

@Module({
  providers: [PipelineWorkerService]
})
export class PipelineWorkerModule {}
