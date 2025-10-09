import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RosterImportDto } from './dto/roster-import.dto';
import { ImportsService } from './imports.service';

@ApiTags('imports')
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('roster')
  @HttpCode(HttpStatus.ACCEPTED)
  async roster(@Body() dto: RosterImportDto) {
    return this.importsService.enqueueRosterImport(dto);
  }
}
