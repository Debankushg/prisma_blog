import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../configs/env';
import type { ApiFailure } from '../types';
import { ApiError } from '../utils/ApiError';
import { isPrismaError, toApiError } from '../utils/handleError';

export const notFoundHandler: RequestHandler = (req, _res, next) =>
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

/** Last line of defence: turns anything that reaches next(error) into a consistent JSON response. */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // The response is already streaming; Express's default handler must close the connection.
  if (res.headersSent) {
    next(err);
    return;
  }

  let status = 500;
  const body: ApiFailure = { success: false, message: 'Internal server error' };

  try {
    if (err instanceof ZodError) {
      status = 422;
      body.message = 'Validation failed';
      body.errors = err.issues.map((i) => ({ path: i.path.slice(1).join('.'), message: i.message }));
    } else if (err instanceof ApiError) {
      status = err.statusCode;
      body.message = err.message;
      if (err.errors) body.errors = err.errors;
    } else if (isPrismaError(err)) {
      const mapped = toApiError(err, `${req.method} ${req.originalUrl}`);
      status = mapped.statusCode;
      body.message = mapped.message;
    } else if (err instanceof SyntaxError && 'body' in err) {
      status = 400;
      body.message = 'Malformed JSON body';
    } else {
      console.error(`[error] ${req.method} ${req.originalUrl}`, err);
      // Show the real message while developing; never leak internals in production.
      if (env.NODE_ENV !== 'production' && err instanceof Error) body.message = err.message;
    }
  } catch (handlerError) {
    // The handler itself must never throw, or the client would get a hanging request.
    console.error('[error] Failed while building the error response', handlerError);
  }

  res.status(status).json(body);
};
