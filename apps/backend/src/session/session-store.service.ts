/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { createId } from '@paralleldrive/cuid2';
import { loadSessionConfig } from './session.config';
import type { SessionRecord } from './types/session-record';
import { generateToken, hashToken } from './utils/token.util';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class SessionStoreService implements OnModuleDestroy {
  private readonly config = loadSessionConfig();
  private readonly redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://redis:6379';
    this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 1 });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  private sessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  private accessKey(accessHash: string): string {
    return `access:${accessHash}`;
  }

  private refreshKey(refreshHash: string): string {
    return `refresh:${refreshHash}`;
  }

  private userSessionsKey(userId: string): string {
    return `user:${userId}:sessions`;
  }

  private hash(token: string): string {
    return hashToken(token, this.config.tokenSecret);
  }

  private serialize(session: SessionRecord): string {
    return JSON.stringify(session);
  }

  private deserialize(raw: string): SessionRecord {
    return JSON.parse(raw) as SessionRecord;
  }

  private accessTtlSeconds(session: SessionRecord): number {
    return Math.max(1, Math.ceil((session.accessExpiresAt - Date.now()) / 1000));
  }

  private refreshTtlSeconds(session: SessionRecord): number {
    return Math.max(
      1,
      Math.ceil((session.refreshExpiresAt - Date.now()) / 1000),
    );
  }

  private async persistSession(
    session: SessionRecord,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    const accessHash = this.hash(accessToken);
    const refreshHash = this.hash(refreshToken);
    const accessTtl = this.accessTtlSeconds(session);
    const refreshTtl = this.refreshTtlSeconds(session);

    const pipeline = this.redis.multi();
    pipeline.set(
      this.sessionKey(session.sessionId),
      this.serialize({
        ...session,
        accessTokenHash: accessHash,
        refreshTokenHash: refreshHash,
      }),
      'EX',
      refreshTtl,
    );
    pipeline.set(this.accessKey(accessHash), session.sessionId, 'EX', accessTtl);
    pipeline.set(
      this.refreshKey(refreshHash),
      session.sessionId,
      'EX',
      refreshTtl,
    );
    pipeline.sadd(this.userSessionsKey(session.userId), session.sessionId);
    await pipeline.exec();
  }

  private async removeTokenIndexes(session: SessionRecord): Promise<void> {
    const pipeline = this.redis.multi();
    pipeline.del(this.accessKey(session.accessTokenHash));
    pipeline.del(this.refreshKey(session.refreshTokenHash));
    await pipeline.exec();
  }

  async createSession(userId: string): Promise<{
    session: SessionRecord;
    tokens: TokenPair;
  }> {
    const now = Date.now();
    const sessionId = createId();
    const accessToken = generateToken();
    const refreshToken = generateToken();

    const session: SessionRecord = {
      sessionId,
      userId,
      accessTokenHash: this.hash(accessToken),
      refreshTokenHash: this.hash(refreshToken),
      accessExpiresAt: now + this.config.accessTtlMs,
      refreshExpiresAt: now + this.config.refreshTtlMs,
      createdAt: now,
    };

    await this.persistSession(session, accessToken, refreshToken);
    await this.enforceSessionLimit(userId);

    return {
      session,
      tokens: { accessToken, refreshToken },
    };
  }

  async getSessionByAccessToken(
    accessToken: string | undefined,
  ): Promise<SessionRecord | null> {
    if (!accessToken) {
      return null;
    }

    const sessionId = await this.redis.get(this.accessKey(this.hash(accessToken)));
    if (!sessionId) {
      return null;
    }

    const session = await this.getSessionById(sessionId);
    if (!session || session.accessExpiresAt <= Date.now()) {
      return null;
    }

    return session;
  }

  async getSessionByRefreshToken(
    refreshToken: string | undefined,
  ): Promise<SessionRecord | null> {
    if (!refreshToken) {
      return null;
    }

    const sessionId = await this.redis.get(
      this.refreshKey(this.hash(refreshToken)),
    );
    if (!sessionId) {
      return null;
    }

    const session = await this.getSessionById(sessionId);
    if (!session || session.refreshExpiresAt <= Date.now()) {
      return null;
    }

    return session;
  }

  async getSessionById(sessionId: string): Promise<SessionRecord | null> {
    const raw = await this.redis.get(this.sessionKey(sessionId));
    if (!raw) {
      return null;
    }

    const session = this.deserialize(raw);
    if (session.refreshExpiresAt <= Date.now()) {
      await this.revokeSession(sessionId);
      return null;
    }

    return session;
  }

  async rotateSession(sessionId: string): Promise<{
    session: SessionRecord;
    tokens: TokenPair;
  } | null> {
    const existing = await this.getSessionById(sessionId);
    if (!existing) {
      return null;
    }

    const accessToken = generateToken();
    const refreshToken = generateToken();
    const updated: SessionRecord = {
      ...existing,
      accessExpiresAt: Date.now() + this.config.accessTtlMs,
    };

    await this.removeTokenIndexes(existing);
    await this.persistSession(updated, accessToken, refreshToken);

    return {
      session: updated,
      tokens: { accessToken, refreshToken },
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    const raw = await this.redis.get(this.sessionKey(sessionId));
    if (!raw) {
      return;
    }

    const session = this.deserialize(raw);
    const pipeline = this.redis.multi();
    pipeline.del(this.sessionKey(sessionId));
    pipeline.del(this.accessKey(session.accessTokenHash));
    pipeline.del(this.refreshKey(session.refreshTokenHash));
    pipeline.srem(this.userSessionsKey(session.userId), sessionId);
    await pipeline.exec();
  }

  async listSessions(userId: string): Promise<SessionRecord[]> {
    const sessionIds = await this.redis.smembers(this.userSessionsKey(userId));
    const sessions: SessionRecord[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSessionById(sessionId);
      if (session) {
        sessions.push(session);
      } else {
        await this.redis.srem(this.userSessionsKey(userId), sessionId);
      }
    }

    return sessions.sort((a, b) => a.createdAt - b.createdAt);
  }

  private async enforceSessionLimit(userId: string): Promise<void> {
    const { maxSessionsPerUser, evictionPolicy } = this.config;
    if (maxSessionsPerUser <= 0) {
      return;
    }

    const sessions = await this.listSessions(userId);
    while (sessions.length > maxSessionsPerUser) {
      const index = evictionPolicy === 'newest' ? sessions.length - 1 : 0;
      const victim = sessions[index];
      await this.revokeSession(victim.sessionId);
      sessions.splice(index, 1);
    }
  }
}
