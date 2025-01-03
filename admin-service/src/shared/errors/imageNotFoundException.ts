import { HttpException, HttpStatus } from '@nestjs/common';

export class ImageNotFoundException extends HttpException {
  constructor() {
    super('Image not found in the provided category', HttpStatus.NOT_FOUND);
  }
}
