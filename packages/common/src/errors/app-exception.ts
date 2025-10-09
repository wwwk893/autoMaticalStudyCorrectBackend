import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCode } from './error-codes';

export class AppException extends HttpException {
  constructor(code: ErrorCode, message: string, status = HttpStatus.BAD_REQUEST) {
    super({ code, message }, status);
  }
}
