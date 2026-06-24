/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { REQUEST_AUTH_KEY, type RequestAuth } from '../types/request-auth';

export type AuthGuardOptions = {
  strict?: boolean;
};

export const AuthGuard = (options: AuthGuardOptions = { strict: true }) => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const strict = options.strict ?? true;
      const request = context.switchToHttp().getRequest<Request>();
      const auth = (request as Request & { [REQUEST_AUTH_KEY]?: RequestAuth })[
        REQUEST_AUTH_KEY
      ];

      if (!auth) {
        if (strict) {
          throw new UnauthorizedException();
        }
        return true;
      }

      const user = await auth.getUser();
      if (!user && strict) {
        throw new UnauthorizedException();
      }

      return true;
    }
  }

  return mixin(AuthGuardMixin);
};
