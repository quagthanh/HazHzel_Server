import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import {
  CreateAdminAuthDto,
  CreateAuthDto,
  CreateStoreOwnerAuthDto,
} from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  ChangePasswordDto,
  CodeAuthDto,
  RetryCodeDto,
  RetryPasswordDto,
} from './dto/checkcode-auth.dto';
import { RolesGuard } from './passport/roles.guard';
import { Role } from '@/enum/role.enum';
import { Roles } from '@/decorator/role.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }
  @Public()
  @Post('register')
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }
  @UseGuards(RolesGuard)
  @Roles(Role.STOREOWNER)
  @Post('register-storeowner')
  registerStoreOwner(@Body() registerStoreOwnerDto: CreateStoreOwnerAuthDto) {
    return this.authService.handleRegisterStoreOwner(registerStoreOwnerDto);
  }
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('register-admin')
  registerAdmin(@Body() registerAdminDto: CreateAdminAuthDto) {
    return this.authService.handleRegisterAdmin(registerAdminDto);
  }
  @Public()
  @Post('check-code')
  checkCode(@Body() codeDto: CodeAuthDto) {
    return this.authService.checkCode(codeDto);
  }
  @Public()
  @Post('retry-active')
  retryActive(@Body() retryCodeDto: RetryCodeDto) {
    return this.authService.retryActive(retryCodeDto);
  }
  @Public()
  @Post('retry-password')
  retryPassword(@Body() retryPasswordDto: RetryPasswordDto) {
    return this.authService.retryPassword(retryPasswordDto);
  }
  @Public()
  @Post('change-password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }
}
