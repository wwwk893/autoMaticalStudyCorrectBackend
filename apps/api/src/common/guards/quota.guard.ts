import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AppException, ErrorCode } from '@app/common';

interface QuotaEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class QuotaGuard implements CanActivate {
  private readonly store = new Map<string, QuotaEntry>();
  private readonly windowMs = 1000;
  private readonly limit = 200;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; traceId?: string }>();
    const teacherId = request.headers['x-teacher-id'];
    const tenantId = request.headers['x-tenant-id'];
    const key = `${tenantId ?? 'global'}:${teacherId ?? 'anonymous'}`;
    const now = Date.now();
    const entry = this.store.get(key) ?? { count: 0, resetAt: now + this.windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + this.windowMs;
    }
    entry.count += 1;
    this.store.set(key, entry);
    if (entry.count > this.limit) {
      throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', 429);
    }
    return true;
  }
}
