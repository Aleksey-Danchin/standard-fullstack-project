import { Controller, Get } from '@nestjs/common';
import type { PublicUser } from '__prisma/types/public-user';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<PublicUser[]> {
    return this.usersService.findAll();
  }
}
