/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from './session-cookie.service';
import { SessionService } from './session.service';
import { SessionStoreService } from './session-store.service';
import {
  REQUEST_AUTH_KEY,
  type RequestAuth,
} from './types/request-auth';
import type { SessionRecord } from './types/session-record';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    private readonly store: SessionStoreService,
    private readonly sessionService: SessionService,
  ) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    let sessionPromise: Promise<SessionRecord | null> | null = null;
    let userPromise: Promise<import('__prisma/types/public-user').PublicUser | null> | null =
      null;

    const auth: RequestAuth = {
      getSession: () => {
        if (!sessionPromise) {
          sessionPromise = this.resolveSession(req);
        }
        return sessionPromise;
      },
      getUser: () => {
        if (!userPromise) {
          userPromise = this.resolveUser(req);
        }
        return userPromise;
      },
    };

    Object.assign(req, { [REQUEST_AUTH_KEY]: auth });
    next();
  }

  private async resolveSession(req: Request): Promise<SessionRecord | null> {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
    const accessSession = await this.store.getSessionByAccessToken(accessToken);
    if (accessSession) {
      return accessSession;
    }

    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;
    return this.store.getSessionByRefreshToken(refreshToken);
  }

  private async resolveUser(req: Request) {
    const session = await this.auth(req).getSession();
    if (!session) {
      return null;
    }

    return this.sessionService.findPublicUser(session.userId);
  }

  private auth(req: Request): RequestAuth {
    return (req as Request & { [REQUEST_AUTH_KEY]: RequestAuth })[
      REQUEST_AUTH_KEY
    ];
  }
}
