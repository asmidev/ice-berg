import { Controller, Post, Put, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { UpdatePasswordDto } from './dto/password.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any, @Body() refreshDto: RefreshTokenDto) {
    return this.authService.logout(req.user.userId, refreshDto.refreshToken);
  }

  @Put('profile')
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.authService.updateProfile(req.user.userId || req.user.sub, body);
  }

  @Put('password')
  updatePassword(@Req() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.userId || req.user.sub, updatePasswordDto);
  }
}
