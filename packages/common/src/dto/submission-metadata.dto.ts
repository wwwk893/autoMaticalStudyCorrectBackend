import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SubmissionMetadataDto {
  @ApiProperty({ description: 'Client platform version', example: 'ios@1.2.3', required: false })
  @IsString()
  @IsOptional()
  clientVersion?: string;

  @ApiProperty({ description: 'Capture device identifier', example: 'ipad-pro-2021', required: false })
  @IsString()
  @IsOptional()
  device?: string;
}
