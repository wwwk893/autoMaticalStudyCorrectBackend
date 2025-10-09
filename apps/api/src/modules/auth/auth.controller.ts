import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { WeappLoginDto } from './dto/weapp-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('weapp/login')
  weappLogin(@Body() dto: WeappLoginDto, @Req() req: Request & { traceId?: string }) {
    const traceId = req.traceId ?? (req.headers['x-trace-id'] as string) ?? '';
    return this.authService.weappLogin(dto, traceId);
  }
}
