import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message || 'Internal server error' };

    const message = typeof exceptionResponse === 'object'
      ? (exceptionResponse as any).message || JSON.stringify(exceptionResponse)
      : exceptionResponse;

    // OWASP: Do not expose stack traces to the client in production
    const isProduction = process.env.NODE_ENV === 'production';
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      ...(isProduction ? {} : { stack: (exception as Error).stack }),
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Critical Error [${request.method} ${request.url}]: ${message}`,
        (exception as Error).stack,
      );
    } else {
      this.logger.warn(
        `Client Error [${request.method} ${request.url}]: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
