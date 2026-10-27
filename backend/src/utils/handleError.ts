import { Prisma } from '@prisma/client';
import { ApiError } from './ApiError';

/** True for any error thrown by Prisma itself (as opposed to our own ApiError / validation errors). */
export const isPrismaError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError ||
  error instanceof Prisma.PrismaClientInitializationError ||
  error instanceof Prisma.PrismaClientRustPanicError ||
  error instanceof Prisma.PrismaClientUnknownRequestError ||
  error instanceof Prisma.PrismaClientValidationError;

/**
 * Converts anything thrown inside a service into an ApiError the client can safely see.
 * - ApiErrors pass through untouched.
 * - Known Prisma failures become the matching HTTP error.
 * - Everything else is logged with context and surfaced as a generic 500, so internals never leak.
 */
export const toApiError = (error: unknown, action: string): ApiError => {
  if (error instanceof ApiError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // unique constraint
        return ApiError.conflict('A record with these details already exists');
      case 'P2003': // foreign key constraint
        return ApiError.badRequest('A related record does not exist');
      case 'P2025': // record required for the operation was not found
        return ApiError.notFound('Record not found');
    }
  }

  // Database unreachable or the query engine crashed: not the caller's fault, and worth retrying.
  if (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientRustPanicError) {
    console.error(`[db] ${action} failed: database unavailable`, error);
    return ApiError.serviceUnavailable();
  }

  console.error(`[error] ${action} failed`, error);
  return ApiError.internal();
};
