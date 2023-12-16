import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Public, GetCurrentUserId, GetCurrentUser } from '../common/decorators';
import { RtGuard, AdminGuard } from '../common/guards';
import { AuthService } from './auth.service';
import { AuthDto, UpdateDto } from './dto';
import { Tokens } from './types';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    console.log(dto);
    return this.authService.signinLocal(dto);
  }

  @Get('local/users')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AdminGuard)
  getAllUsers(): Promise<any[]> {
    return this.authService.getAllUser();
  }

  @Get('local/user/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AdminGuard)
  getUsersById(@Param('id') userId: number): Promise<User[]> {
    return this.authService.getUserById(userId);
  }

  @Patch('local/update/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AdminGuard)
  updateUserDataByID(
    @Param('id') userId: number,
    @Body() dto: UpdateDto,
  ): Promise<string> {
    return this.authService.updateUserData(userId, dto, true);
  }

  // If user want to delete its account
  @Delete('local/delete')
  @HttpCode(HttpStatus.ACCEPTED)
  deleteUser(@GetCurrentUserId() userId: number): Promise<string> {
    return this.authService.deleteUser(userId);
  }

  //If Admin Want to delete some user
  @Delete('admin/delete/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AdminGuard)
  deleteUserThrouhAdmin(@Param('id') userId: number): Promise<string> {
    return this.authService.deleteUser(userId);
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
