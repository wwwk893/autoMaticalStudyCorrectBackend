import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UploadCallbackDto } from './dto/upload-callback.dto';
import { PresignRequestDto } from './dto/presign-request.dto';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  presign(@Body() dto: PresignRequestDto) {
    return this.uploadsService.presign(dto);
  }

  @Post('callback')
  @HttpCode(HttpStatus.NO_CONTENT)
  callback(@Headers() headers: Record<string, string>, @Body() body: UploadCallbackDto) {
    this.uploadsService.validateCallback(headers, body);
  }
}
