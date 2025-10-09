import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WeappLoginDto {
  @ApiProperty({ description: 'wx.login 获取的 code' })
  @IsString()
  code!: string;

  @ApiProperty({ description: '待绑定教师 ID' })
  @IsString()
  teacherId!: string;

  @ApiProperty({ description: '教师所属租户', required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ description: '客户端元数据', required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
