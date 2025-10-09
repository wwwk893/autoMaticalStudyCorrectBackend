import { Injectable, Logger } from '@nestjs/common';

import { AppException, ErrorCode } from '@app/common';

@Injectable()
export class ContentSafetyService {
  private readonly logger = new Logger(ContentSafetyService.name);
  private readonly bannedKeywords = ['违规', '违禁'];

  scan(text: string | undefined, traceId: string | undefined) {
    if (!text) {
      return;
    }
    if (this.bannedKeywords.some((keyword) => text.includes(keyword))) {
      this.logger.warn(`Content safety blocked traceId=${traceId ?? ''}`);
      throw new AppException(ErrorCode.CONTENT_SAFETY_BLOCKED, 'content rejected', 403);
    }
  }
}
