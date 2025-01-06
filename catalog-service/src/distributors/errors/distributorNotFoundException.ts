import { HttpException, HttpStatus } from '@nestjs/common';

export class DistributorNotFoundException extends HttpException {
  constructor() {
    super('Distributor not found', HttpStatus.NOT_FOUND);
  }
}
