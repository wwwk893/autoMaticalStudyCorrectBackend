import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import { AppException, ErrorCode } from '@app/common';

import { TenancyService } from '../tenancy/tenancy.service';
import { WeappLoginDto } from './dto/weapp-login.dto';

interface WeappSession {
  openid: string;
  unionid?: string;
}

@Injectable()
export class AuthService {
  private readonly bindings = new Map<string, { teacherId: string; tenantId: string }>();

  constructor(private readonly tenancy: TenancyService) {}

  async weappLogin(dto: WeappLoginDto, traceId: string) {
    const teacher = this.tenancy.findTeacherById(dto.teacherId);
    if (!teacher) {
      throw new AppException(ErrorCode.AUTH_TEACHER_NOT_FOUND, 'Teacher not found');
    }
    if (dto.tenantId && teacher.tenantId !== dto.tenantId) {
      throw new AppException(ErrorCode.AUTH_TEACHER_NOT_FOUND, 'Teacher does not belong to tenant');
    }

    const session = await this.exchangeCode(dto.code);
    const existingBinding = this.tenancy.findTeacherByOpenId(session.openid);
    if (existingBinding && existingBinding.id !== teacher.id) {
      throw new AppException(ErrorCode.AUTH_WEAPP_ALREADY_BOUND, 'WeChat account already bound', 409);
    }

    const teacherBinding = this.bindings.get(teacher.id);
    if (teacherBinding) {
      if (teacherBinding.teacherId === teacher.id && teacherBinding.tenantId === teacher.tenantId) {
        return this.buildSessionPayload(teacher.id, teacher.tenantId, traceId);
      }
      throw new AppException(ErrorCode.AUTH_WEAPP_ALREADY_BOUND, 'Teacher already bound to another account', 409);
    }

    this.tenancy.bindWeappAccount(teacher.id, session.openid);
    this.bindings.set(teacher.id, { teacherId: teacher.id, tenantId: teacher.tenantId });
    return this.buildSessionPayload(teacher.id, teacher.tenantId, traceId);
  }

  private async exchangeCode(code: string): Promise<WeappSession> {
    // 模拟 code2Session，真实场景应调用微信 API
    const openid = createHash('sha256').update(code).digest('hex').slice(0, 28);
    const unionid = createHash('md5').update(code).digest('hex');
    return { openid, unionid };
  }

  private buildSessionPayload(teacherId: string, tenantId: string, traceId: string) {
    return {
      teacherId,
      tenantId,
      accessToken: createHash('sha1').update(`${teacherId}:${tenantId}`).digest('hex'),
      expiresIn: 3600,
      traceId
    };
  }
}
