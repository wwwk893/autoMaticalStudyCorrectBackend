import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('gradebook')
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel'] })
  gradebook(@Query('format') format: 'pdf' | 'excel' = 'pdf') {
    return this.reportsService.generateGradeReport(format);
  }
}
