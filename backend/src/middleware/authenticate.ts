import type { RequestHandler } from 'express';
import { env } from '../configs/env';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';

/** Reads the JWT from the httpOnly cookie, falling back to a Bearer header for non-browser clients. */
const extractToken = (req: Parameters<RequestHandler>[0]): string | undefined => {
  const fromCookie: unknown = req.cookies?.[env.COOKIE_NAME];
  if (typeof fromCookie === 'string' && fromCookie) return fromCookie;
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
};

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized('Not authenticated'));
  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};
