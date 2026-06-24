/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { createHmac, randomBytes } from 'node:crypto';

const TOKEN_BYTE_LENGTH = 32;

export function generateToken(): string {
  return randomBytes(TOKEN_BYTE_LENGTH).toString('hex');
}

export function hashToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}
