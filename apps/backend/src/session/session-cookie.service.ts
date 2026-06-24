/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { loadSessionConfig } from './session.config';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/session';

@Injectable()
export class SessionCookieService {
  private readonly config = loadSessionConfig();

  setTokens(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessMaxAgeMs: number,
    refreshMaxAgeMs: number,
  ): void {
    const secure = true;
    const sameSite = 'lax' as const;
    const domain = this.config.cookieDomain;

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge: accessMaxAgeMs,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: REFRESH_COOKIE_PATH,
      maxAge: refreshMaxAgeMs,
    });
  }

  clearTokens(res: Response): void {
    const secure = true;
    const sameSite = 'lax' as const;
    const domain = this.config.cookieDomain;

    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: '/',
    });

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: REFRESH_COOKIE_PATH,
    });
  }
}
