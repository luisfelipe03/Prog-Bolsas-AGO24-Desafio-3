import { HttpException, HttpStatus } from '@nestjs/common';

export class NoProductsNotFoundException extends HttpException {
  constructor() {
    super('Products not found', HttpStatus.NOT_FOUND);
  }
}
