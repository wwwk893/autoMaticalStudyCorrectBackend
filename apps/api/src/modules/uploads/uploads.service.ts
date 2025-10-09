import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { nanoid } from 'nanoid';

import { AppException, ErrorCode } from '@app/common';
import { MetricsService } from '../../../../src/observability/metrics.service';
import { UploadCallbackDto } from './dto/upload-callback.dto';
import { PresignRequestDto } from './dto/presign-request.dto';

interface PresignResponse {
  uploadUrl: string;
  expiresAt: string;
  formFields: Record<string, string>;
  assetKey: string;
}

@Injectable()
export class UploadsService {
  private readonly allowedTypes: string[];
  private readonly maxSize: number;
  private readonly maxPages: number;
  private readonly ttlSeconds: number;
  private readonly callbackSecret: string;
  private readonly callbackMaxDrift: number;
  private readonly replayCache = new Map<string, number>();

  constructor(private readonly configService: ConfigService, private readonly metrics: MetricsService) {
    this.allowedTypes = (configService.get<string>('UPLOAD_ALLOWED_TYPES') ?? '').split(',').filter(Boolean);
    this.maxSize = Number(configService.get<number>('UPLOAD_MAX_SIZE') ?? 5 * 1024 * 1024);
    this.maxPages = Number(configService.get<number>('UPLOAD_MAX_PAGES') ?? 20);
    this.ttlSeconds = Number(configService.get<number>('UPLOAD_TTL_SECONDS') ?? 900);
    this.callbackSecret = configService.get<string>('UPLOAD_CALLBACK_SECRET') ?? 'local-secret';
    this.callbackMaxDrift = Number(configService.get<number>('UPLOAD_CALLBACK_MAX_DRIFT') ?? 300);
  }

  presign(dto: PresignRequestDto): PresignResponse {
    if (this.allowedTypes.length && !this.allowedTypes.includes(dto.contentType)) {
      throw new AppException(ErrorCode.UPLOAD_VALIDATION_FAILED, 'contentType not allowed');
    }
    if (dto.size > this.maxSize) {
      throw new AppException(ErrorCode.UPLOAD_VALIDATION_FAILED, 'file size exceeds limit');
    }
    if (dto.pages > this.maxPages) {
      throw new AppException(ErrorCode.UPLOAD_VALIDATION_FAILED, 'page count exceeds limit');
    }

    const assetKey = `${Date.now()}-${nanoid()}-${dto.filename}`;
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);
    const uploadUrl = `${this.configService.get('MINIO_ENDPOINT') ?? 'http://localhost:9000'}/${
      this.configService.get('MINIO_BUCKET') ?? 'autograde'
    }/${assetKey}`;
    this.metrics.recordUploadSize(dto.size);
    return {
      uploadUrl,
      expiresAt: expiresAt.toISOString(),
      formFields: { 'x-amz-meta-checksum': dto.checksum ?? '' },
      assetKey
    };
  }

  validateCallback(headers: Record<string, string | string[] | undefined>, body: UploadCallbackDto) {
    const signature = headers['x-signature'];
    const timestamp = Number(headers['x-timestamp']);
    if (!signature || !timestamp) {
      throw new AppException(ErrorCode.UPLOAD_SIGNATURE_INVALID, 'signature required', 401);
    }
    if (Math.abs(Date.now() - timestamp) > this.callbackMaxDrift * 1000) {
      throw new AppException(ErrorCode.UPLOAD_SIGNATURE_INVALID, 'signature expired', 401);
    }
    if (this.replayCache.has(signature as string)) {
      throw new AppException(ErrorCode.UPLOAD_SIGNATURE_INVALID, 'replay detected', 401);
    }
    const expected = createHmac('sha256', this.callbackSecret).update(JSON.stringify(body)).update(String(timestamp)).digest('hex');
    if (expected !== signature) {
      throw new AppException(ErrorCode.UPLOAD_SIGNATURE_INVALID, 'signature mismatch', 401);
    }
    this.replayCache.set(signature as string, Date.now());
    setTimeout(() => this.replayCache.delete(signature as string), this.callbackMaxDrift * 1000);
  }
}
