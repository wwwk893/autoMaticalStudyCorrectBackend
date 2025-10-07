import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { WorkerModule } from './worker.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(WorkerModule, { bufferLogs: true });
  const logger = appContext.get(Logger);
  logger.log('Worker application context initialized');
}

bootstrap();
