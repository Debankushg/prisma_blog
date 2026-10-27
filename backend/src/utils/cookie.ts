import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env';

const baseOptions: CookieOptions = {
  httpOnly: true, // not readable from JavaScript, so XSS can't steal the session
  secure: env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // blocks cross-site POSTs (CSRF) while allowing normal navigation
  path: '/',
};

/** Cookie lifetime follows the JWT's own `exp`, so the two never disagree. */
export const setAuthCookie = (res: Response, token: string): void => {
  const exp = jwt.decode(token, { json: true })?.exp;
  const maxAge = exp ? Math.max(exp * 1000 - Date.now(), 0) : undefined;
  res.cookie(env.COOKIE_NAME, token, { ...baseOptions, maxAge });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(env.COOKIE_NAME, baseOptions);
};
