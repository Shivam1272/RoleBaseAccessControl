import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role as PrismaRole, User } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

import { AuthDto, UpdateDto } from './dto';
import { JwtPayload, Tokens } from './types';
import { isNumber } from 'class-validator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) { }

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const hash = await argon.hash(dto.password);
    let userRole = await this.prisma.role.findFirst({
      where: {
        name: "USER"
      },
    })

    if (!isNumber(userRole.id)) {
      userRole = await this.prisma.role.create({
        data: {
          name: "USER"
        }
      })
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
        role: {
          connect: {
            id: userRole.id,
          },
        },
      },
    }).catch((error) => {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials incorrect');
      }
      throw error;
    });

    const tokens = await this.getTokens(user.id, user.email, userRole.name);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    console.log("dto", dto);
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    console.log("user", user?.hash);

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await argon.verify(user.hash, dto.password);
    console.log("pm", passwordMatches);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const role = await this.prisma.role.findUnique({
      where: {
        id: user.roleId,
      },
    });

    if (!role) {
      throw new ForbiddenException('Invalid role');
    }
    const tokens = await this.getTokens(user.id, user.email, role.name);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async getAllUser(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async getUserById(userId: number): Promise<User> {
    const users = await this.prisma.user.findMany({
      where: {
        id: Number(userId),
      }
    });
    return users;
  }

  async updateUserData(
    userId: number,
    updateUserDto: UpdateDto,
    isAdmin: boolean,
  ): Promise<User> {
    const userIdInNum = Number(userId);
    const user = await this.prisma.user.findUnique({
      where: {
        id: userIdInNum,
      },
    });

    if (!user) {
      throw new ForbiddenException('User Not Found');
    }

    if (isAdmin && updateUserDto.roleId) {
      await this.updateUserRole(userId, updateUserDto.roleId);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roleId, ...restUserData } = updateUserDto;

    const updatedUserDetail = await this.prisma.user.update({
      where: {
        id: userIdInNum,
      },
      data: {
        ...restUserData,
      },
    });

    return updatedUserDetail;
  }

  private async updateUserRole(userId: number, roleId: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: {
        id: Number(roleId),
      },
    });

    if (!role) {
      throw new ForbiddenException('Invalid role');
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: {
          connect: {
            id: role.id,
          },
        },
      },
    });
  }

  async deleteUser(userId: number): Promise<string> {
    const userIdInInt = Number(userId);

    await this.prisma.user.delete({
      where: { id: userIdInInt },
    });

    return 'Successfully Deleted User';
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });

    return true;
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const role = await this.prisma.role.findUnique({
      where: {
        id: user.roleId,
      },
    });

    if (!role) {
      throw new ForbiddenException('Invalid role');
    }

    const tokens = await this.getTokens(user.id, user.email, role.name);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await argon.hash(rt);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async getTokens(userId: number, email: string, role: PrismaRole['name']): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
      role: role,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
