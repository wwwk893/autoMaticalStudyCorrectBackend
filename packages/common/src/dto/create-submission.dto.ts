import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { SubmissionMetadataDto } from './submission-metadata.dto';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'Assignment identifier', example: 'assignment-123' })
  @IsString()
  @IsNotEmpty()
  assignmentId!: string;

  @ApiProperty({ description: 'Student identifier', example: 'student-456' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({
    description: 'Captured image asset keys stored in object storage',
    example: ['s3://bucket/submission/page-1.jpg']
  })
  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @ApiProperty({ enum: ['zh', 'en', 'math'], example: 'math', required: false })
  @IsEnum(['zh', 'en', 'math'])
  @IsOptional()
  subject?: 'zh' | 'en' | 'math';

  @ApiProperty({ type: SubmissionMetadataDto, required: false })
  @ValidateNested()
  @Type(() => SubmissionMetadataDto)
  @IsOptional()
  metadata?: SubmissionMetadataDto;
}
