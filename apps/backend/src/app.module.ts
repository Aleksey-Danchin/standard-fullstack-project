/**
 * @scaffold-integration — scaffold wiring point.
 * Add your imports/providers; avoid rewriting scaffold core unless needed. See SCAFFOLD.md
 */


import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SessionModule } from './session/session.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, SessionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
