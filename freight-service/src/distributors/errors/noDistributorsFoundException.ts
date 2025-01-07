import { HttpException, HttpStatus } from '@nestjs/common';

export class NoDistributorsFoundException extends HttpException {
  constructor() {
    super('No distributors found', HttpStatus.NOT_FOUND);
  }
}
