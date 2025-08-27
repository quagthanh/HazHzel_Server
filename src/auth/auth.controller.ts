import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Req,
} from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LocalAuthGuard } from '@/auth/strategies/local/local-auth.guard';
import { Public, ResponseMessage } from '@/shared/decorators/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import {
  ChangePasswordDto,
  CodeAuthDto,
  RetryCodeDto,
  RetryPasswordDto,
} from '@/auth/dto/checkcode-auth.dto';
import { RolesGuard } from './guards/roles.guard';
import { RoleEnum } from '@/shared/enums/role.enum';
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
  @ResponseMessage('Register success')
  async register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
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
