import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LocalAuthGuard } from '@/auth/strategies/local/local-auth.guard';
import { Public, ResponseMessage } from '@/shared/decorators/customize';
import {
  CreateAdminAuthDto,
  CreateAuthDto,
  CreateStoreOwnerAuthDto,
} from './dto/create-auth.dto';
import {
  ChangePasswordDto,
  CodeAuthDto,
  RetryCodeDto,
  RetryPasswordDto,
} from '@/auth/dto/checkcode-auth.dto';
import { RolesGuard } from './guards/roles.guard';
import { Role } from '@/shared/enums/role.enum';
import { Roles } from '@/shared/decorators/role.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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
  @Roles(Role.ADMIN)
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
