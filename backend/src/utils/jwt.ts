import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../configs/env';
import type { JwtPayload } from '../types';

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || typeof decoded['email'] !== 'string') {
    throw new Error('Malformed token');
  }
  return { sub: decoded.sub, email: decoded['email'] };
};
