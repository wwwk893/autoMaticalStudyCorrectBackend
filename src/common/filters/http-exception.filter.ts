import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { nanoid } from 'nanoid';

const FALLBACK_CODE = 'UNEXPECTED_ERROR';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { traceId?: string }>();
    const response = ctx.getResponse<Response>();

    const traceId = this.resolveTraceId(request, response);
    const { statusCode, message, code } = this.extractExceptionPayload(exception);

    const payload = { code, message, traceId };
    if (!(exception instanceof HttpException)) {
      this.logger.error(`Unhandled exception`, exception instanceof Error ? exception.stack : String(exception));
    }
    httpAdapter.reply(response, payload, statusCode);
  }

  private resolveTraceId(request: Request & { traceId?: string }, response: Response) {
    const headerName = (process.env.TRACE_HEADER ?? 'x-trace-id').toLowerCase();
    const incoming = request.headers[headerName] as string | undefined;
    const traceId = request.traceId ?? incoming ?? nanoid(12);
    response.setHeader(headerName, traceId);
    request.traceId = traceId;
    return traceId;
  }

  private extractExceptionPayload(exception: unknown) {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response) {
        const body = response as Record<string, unknown>;
        return {
          statusCode,
          message: String(body.message ?? body.error ?? exception.message),
          code: String(body.code ?? FALLBACK_CODE)
        };
      }
      return {
        statusCode,
        message: String(response ?? exception.message),
        code: FALLBACK_CODE
      };
    }
    const message = exception instanceof Error ? exception.message : 'Internal server error';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      code: FALLBACK_CODE
    };
  }
}
