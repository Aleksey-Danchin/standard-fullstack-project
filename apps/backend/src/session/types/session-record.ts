/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


export type SessionRecord = {
  sessionId: string;
  userId: string;
  accessTokenHash: string;
  refreshTokenHash: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
  createdAt: number;
};

export type SessionListItem = {
  sessionId: string;
  createdAt: string;
  accessExpiresAt: string;
  sessionExpiresAt: string;
  isCurrent: boolean;
};

export type SessionPayload = {
  user: import('__prisma/types/public-user').PublicUser;
  sessionId: string;
  accessExpiresAt: string;
  sessionExpiresAt: string;
};
