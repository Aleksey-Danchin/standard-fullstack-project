/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionController } from './session.controller';
import { SessionCookieService } from './session-cookie.service';
import { SessionMiddleware } from './session.middleware';
import { SessionService } from './session.service';
import { SessionStoreService } from './session-store.service';

@Module({
  imports: [PrismaModule],
  controllers: [SessionController],
  providers: [
    SessionStoreService,
    SessionCookieService,
    SessionService,
    SessionMiddleware,
  ],
  exports: [SessionService, SessionStoreService],
})
export class SessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SessionMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
