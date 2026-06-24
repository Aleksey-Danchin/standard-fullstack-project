/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import type { PublicUser } from '__prisma/types/public-user';
import { PrismaService } from '../prisma/prisma.service';
import { loadSessionConfig } from './session.config';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SessionCookieService,
} from './session-cookie.service';
import { SessionStoreService } from './session-store.service';
import type {
  SessionListItem,
  SessionPayload,
  SessionRecord,
} from './types/session-record';

@Injectable()
export class SessionService {
  private readonly config = loadSessionConfig();

  constructor(
    private readonly store: SessionStoreService,
    private readonly cookies: SessionCookieService,
    private readonly prisma: PrismaService,
  ) {}

  async login(
    login: string,
    password: string,
    res: Response,
  ): Promise<SessionPayload> {
    const user = await this.prisma.user.findUnique({ where: { login } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { session, tokens } = await this.store.createSession(user.id);
    this.setSessionCookies(res, session, tokens);

    return this.toPayload(this.toPublicUser(user), session);
  }

  async check(req: Request, res: Response): Promise<SessionPayload> {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;

    const activeSession = await this.store.getSessionByAccessToken(accessToken);
    if (activeSession) {
      return this.buildPayloadForSession(activeSession);
    }

    const refreshSession =
      await this.store.getSessionByRefreshToken(refreshToken);
    if (!refreshSession) {
      return this.rejectSession(res);
    }

    const rotated = await this.store.rotateSession(refreshSession.sessionId);
    if (!rotated) {
      return this.rejectSession(res);
    }

    this.setSessionCookies(res, rotated.session, rotated.tokens);
    return this.buildPayloadForSession(rotated.session);
  }

  async refresh(req: Request, res: Response): Promise<SessionPayload> {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;
    const refreshSession =
      await this.store.getSessionByRefreshToken(refreshToken);

    if (!refreshSession) {
      return this.rejectSession(res);
    }

    const rotated = await this.store.rotateSession(refreshSession.sessionId);
    if (!rotated) {
      return this.rejectSession(res);
    }

    this.setSessionCookies(res, rotated.session, rotated.tokens);
    return this.buildPayloadForSession(rotated.session);
  }

  async logout(req: Request, res: Response): Promise<{ ok: true }> {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;

    const session =
      (await this.store.getSessionByAccessToken(accessToken)) ??
      (await this.store.getSessionByRefreshToken(refreshToken));

    if (session) {
      await this.store.revokeSession(session.sessionId);
    }

    this.cookies.clearTokens(res);
    return { ok: true };
  }

  async listSessions(
    userId: string,
    currentSessionId: string | null,
  ): Promise<SessionListItem[]> {
    const sessions = await this.store.listSessions(userId);

    return sessions.map((session) => ({
      sessionId: session.sessionId,
      createdAt: new Date(session.createdAt).toISOString(),
      accessExpiresAt: new Date(session.accessExpiresAt).toISOString(),
      sessionExpiresAt: new Date(session.refreshExpiresAt).toISOString(),
      isCurrent: session.sessionId === currentSessionId,
    }));
  }

  async revokeSessionForUser(
    userId: string,
    sessionId: string,
    currentSessionId: string | null,
    res: Response,
  ): Promise<{ ok: true }> {
    const session = await this.store.getSessionById(sessionId);
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    await this.store.revokeSession(sessionId);

    if (currentSessionId === sessionId) {
      this.cookies.clearTokens(res);
    }

    return { ok: true };
  }

  async findPublicUser(userId: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  private async buildPayloadForSession(
    session: SessionRecord,
  ): Promise<SessionPayload> {
    const user = await this.findPublicUser(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toPayload(user, session);
  }

  private toPayload(user: PublicUser, session: SessionRecord): SessionPayload {
    return {
      user,
      sessionId: session.sessionId,
      accessExpiresAt: new Date(session.accessExpiresAt).toISOString(),
      sessionExpiresAt: new Date(session.refreshExpiresAt).toISOString(),
    };
  }

  private toPublicUser(user: {
    id: string;
    login: string;
    createdAt: Date;
    updatedAt: Date;
  }): PublicUser {
    return {
      id: user.id,
      login: user.login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private setSessionCookies(
    res: Response,
    session: SessionRecord,
    tokens: { accessToken: string; refreshToken: string },
  ): void {
    this.cookies.setTokens(
      res,
      tokens.accessToken,
      tokens.refreshToken,
      session.accessExpiresAt - Date.now(),
      session.refreshExpiresAt - Date.now(),
    );
  }

  private rejectSession(res: Response): never {
    this.cookies.clearTokens(res);
    throw new UnauthorizedException('Session expired');
  }
}
