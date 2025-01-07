import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const error =
      typeof errorResponse === 'string'
        ? { message: errorResponse }
        : errorResponse;

    response.status(status).json({
      statusCode: status,
      ...error,
      timestamp: new Date().toISOString(),
    });
  }
}
