/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { parseDuration } from './utils/parse-duration';

export type SessionEvictionPolicy = 'oldest' | 'newest';

export type SessionConfig = {
  cookieDomain: string;
  accessTtlMs: number;
  refreshTtlMs: number;
  tokenSecret: string;
  maxSessionsPerUser: number;
  evictionPolicy: SessionEvictionPolicy;
  reuseDetectionMode: 'reject' | 'off';
};

export function loadSessionConfig(): SessionConfig {
  const maxSessions = Number(process.env.SESSION_MAX_PER_USER ?? '0');

  return {
    cookieDomain: process.env.SESSION_COOKIE_DOMAIN ?? 'localhost',
    accessTtlMs: parseDuration(process.env.SESSION_ACCESS_TTL ?? '10m'),
    refreshTtlMs: parseDuration(process.env.SESSION_REFRESH_TTL ?? '7d'),
    tokenSecret: process.env.SESSION_TOKEN_SECRET ?? 'change-me-in-production',
    maxSessionsPerUser: Number.isFinite(maxSessions) ? maxSessions : 0,
    evictionPolicy:
      process.env.SESSION_EVICTION_POLICY === 'newest' ? 'newest' : 'oldest',
    reuseDetectionMode:
      process.env.REUSE_DETECTION_MODE === 'off' ? 'off' : 'reject',
  };
}
