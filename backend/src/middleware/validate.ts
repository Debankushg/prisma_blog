import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/** Validates { body, query, params } and replaces them with the parsed (typed, trimmed, coerced) values. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validate = (schema: ZodTypeAny): RequestHandler<any, any, any, any> => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) return next(result.error);
  const parsed = result.data as { body?: unknown; query?: unknown; params?: unknown };
  if (parsed.body !== undefined) req.body = parsed.body;
  if (parsed.query !== undefined) req.query = parsed.query;
  if (parsed.params !== undefined) req.params = parsed.params;
  next();
};
