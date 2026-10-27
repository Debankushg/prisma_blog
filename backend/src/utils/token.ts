import { createHash, randomBytes } from 'node:crypto';

/** Opaque random token sent to the user; only its SHA-256 hash is stored. */
export const generateResetToken = (): { token: string; tokenHash: string } => {
  const token = randomBytes(32).toString('hex');
  return { token, tokenHash: hashToken(token) };
};

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');
