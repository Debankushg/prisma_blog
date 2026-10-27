import type { User } from '@prisma/client';

/** User shape that is safe to expose over the API (no password). */
export type PublicUser = Omit<User, 'password'>;

export interface AuthResult {
  user: PublicUser;
  token: string;
}

/** What the API returns: the token itself travels only in the httpOnly cookie. */
export interface AuthResponse {
  user: PublicUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
}
