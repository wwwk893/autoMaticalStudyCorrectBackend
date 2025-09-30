import { ApiProperty } from '@nestjs/swagger';

import { CreateSubmissionDto } from './create-submission.dto';

export class SubmissionStatusDto {
  @ApiProperty({ description: 'Submission identifier' })
  id!: string;

  @ApiProperty({ description: 'Current processing status', example: 'queued' })
  status!: string;

  @ApiProperty({ description: 'ISO timestamp when the submission was received', nullable: true })
  receivedAt!: string | null;

  @ApiProperty({ description: 'Original submission payload (optional)', type: CreateSubmissionDto, nullable: true })
  payload!: CreateSubmissionDto | null;
}
