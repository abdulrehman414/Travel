import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@travel/db';
import type { ApiFieldError } from '@travel/types';
import { AppError, ConflictError, NotFoundError, ValidationError } from '../lib/api-error';
import { logger } from '../config/logger';
import { isProd } from '../config/env';

function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002': {
      const target = (error.meta?.target as string[] | undefined)?.join(', ');
      return new ConflictError(
        target ? `A record with this ${target} already exists` : 'Record already exists',
      );
    }
    case 'P2025':
      return new NotFoundError('The requested record was not found');
    case 'P2003':
      return new AppError('Related record constraint failed', 400, 'FK_CONSTRAINT');
    default:
      return new AppError('Database request error', 400, 'DB_REQUEST_ERROR');
  }
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof ZodError) {
    const fields: ApiFieldError[] = error.issues.map((issue) => ({
      path: issue.path.join('.') || '(root)',
      message: issue.message,
    }));
    return new ValidationError(fields);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return mapPrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError('Invalid database query', 400, 'DB_VALIDATION_ERROR');
  }

  return new AppError('Something went wrong', 500, 'INTERNAL_ERROR');
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const appError = toAppError(err);

  const logPayload = { reqId: req.id, method: req.method, path: req.originalUrl, err };
  if (appError.statusCode >= 500) {
    logger.error(logPayload, appError.message);
  } else {
    logger.warn(logPayload, appError.message);
  }

  const message =
    appError.statusCode >= 500 && isProd ? 'Something went wrong on our end' : appError.message;

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message,
      ...(appError.fields ? { fields: appError.fields } : {}),
    },
  });
};
