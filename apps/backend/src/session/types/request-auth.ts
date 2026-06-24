/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import type { PublicUser } from '__prisma/types/public-user';
import type { SessionRecord } from './session-record';

export type RequestAuth = {
  getSession: () => Promise<SessionRecord | null>;
  getUser: () => Promise<PublicUser | null>;
};

export const REQUEST_AUTH_KEY = 'requestAuth';
