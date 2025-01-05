import { HttpException, HttpStatus } from '@nestjs/common';

export class NoCategoriesFoundException extends HttpException {
  constructor() {
    super('No categories found', HttpStatus.NOT_FOUND);
  }
}
