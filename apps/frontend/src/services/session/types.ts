/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import type { PublicUser } from '__prisma/types/public-user';
import type { LoginDto } from '__backend/src/session/dto/login.dto';

export type { LoginDto };

export type SessionPayloadDto = {
  user: PublicUser;
  sessionId: string;
  accessExpiresAt: string;
  sessionExpiresAt: string;
};

export type Session = {
  sessionId: string;
  user: PublicUser;
  accessExpiresAt: Date;
  sessionExpiresAt: Date;
};

export function mapSessionPayload(dto: SessionPayloadDto): Session {
  return {
    sessionId: dto.sessionId,
    user: dto.user,
    accessExpiresAt: new Date(dto.accessExpiresAt),
    sessionExpiresAt: new Date(dto.sessionExpiresAt),
  };
}
