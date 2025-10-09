import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded, Request, Response, NextFunction } from 'express';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const httpAdapter = app.get(HttpAdapterHost);
  app.use((req: Request & { traceId?: string }, res: Response, next: NextFunction) => {
    const headerName = (process.env.TRACE_HEADER ?? 'x-trace-id').toLowerCase();
    const incoming = (req.headers[headerName] as string | undefined) ?? undefined;
    const traceId = incoming ?? req.traceId ?? cryptoRandom();
    req.traceId = traceId;
    res.setHeader(headerName, traceId);
    next();
  });
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));

  const config = new DocumentBuilder()
    .setTitle('Automatic Study Correct API')
    .setDescription('API Gateway for the automatic homework grading platform.')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 3000);
  await app.listen(port);
}

bootstrap();

function cryptoRandom() {
  return Math.random().toString(16).slice(2, 14);
}
