import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateSubmissionDto } from '@app/common/dto/create-submission.dto';

import { SubmissionsService } from './submissions.service';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a submission and enqueue OCR processing' })
  async createSubmission(@Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve submission status (mock implementation)' })
  async getSubmission(@Param('id') id: string) {
    return this.submissionsService.getStatus(id);
  }
}
