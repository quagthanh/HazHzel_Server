import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message:
          'Invalid account or password. Please reset your password if you have trouble logging in',
      });
    }
    if (user.isActive === false) {
      throw new BadRequestException('Account is not ative yet');
    }
    return user;
  }
}
