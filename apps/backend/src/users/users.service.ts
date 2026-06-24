import { Injectable } from '@nestjs/common';
import type { PublicUser } from '__prisma/types/public-user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      orderBy: { login: 'asc' },
      select: {
        id: true,
        login: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
