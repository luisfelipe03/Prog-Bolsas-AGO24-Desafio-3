import { NotFoundException } from '@nestjs/common';

export class PostalCodeInvalidError extends NotFoundException {
  constructor(message: string) {
    super(message);
    this.name = 'PostalCodeInvalidError';
  }
}
