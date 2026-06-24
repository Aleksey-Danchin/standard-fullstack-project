/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '__prisma/types/public-user';
import { REQUEST_AUTH_KEY, type RequestAuth } from '../types/request-auth';

export const SessionUser = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext): Promise<PublicUser | null> => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const auth = (request as Request & { [REQUEST_AUTH_KEY]?: RequestAuth })[
      REQUEST_AUTH_KEY
    ];

    if (!auth) {
      return null;
    }

    return auth.getUser();
  },
);

export async function getSessionUser(
  request: Request,
): Promise<PublicUser | null> {
  const auth = (request as Request & { [REQUEST_AUTH_KEY]?: RequestAuth })[
    REQUEST_AUTH_KEY
  ];
  return auth ? auth.getUser() : null;
}

export async function getSessionId(request: Request): Promise<string | null> {
  const auth = (request as Request & { [REQUEST_AUTH_KEY]?: RequestAuth })[
    REQUEST_AUTH_KEY
  ];
  if (!auth) {
    return null;
  }

  const session = await auth.getSession();
  return session?.sessionId ?? null;
}
