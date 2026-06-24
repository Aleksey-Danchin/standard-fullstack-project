/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { PublicUser } from '__prisma/types/public-user';
import {
  getSessionId,
  SessionUser,
} from './decorators/session-user.decorator';
import { loginDtoSchema } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { SessionService } from './session.service';
import type { SessionListItem, SessionPayload } from './types/session-record';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('login')
  login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionPayload> {
    const parsed = loginDtoSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.sessionService.login(
      parsed.data.login,
      parsed.data.password,
      res,
    );
  }

  @Post('logout')
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    return this.sessionService.logout(req, res);
  }

  @Get('check')
  check(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionPayload> {
    return this.sessionService.check(req, res);
  }

  @Post('refresh')
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionPayload> {
    return this.sessionService.refresh(req, res);
  }

  @Get('list')
  @UseGuards(AuthGuard())
  async list(
    @SessionUser() user: PublicUser,
    @Req() req: Request,
  ): Promise<{ sessions: SessionListItem[] }> {
    const currentSessionId = await getSessionId(req);
    const sessions = await this.sessionService.listSessions(
      user.id,
      currentSessionId,
    );
    return { sessions };
  }

  @Delete(':sessionId')
  @UseGuards(AuthGuard())
  async revoke(
    @SessionUser() user: PublicUser,
    @Param('sessionId') sessionId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const currentSessionId = await getSessionId(req);
    return this.sessionService.revokeSessionForUser(
      user.id,
      sessionId,
      currentSessionId,
      res,
    );
  }
}
