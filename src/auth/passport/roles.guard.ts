import { ROLES_KEY } from '@/decorator/role.decorator';
import { Role } from '@/enum/role.enum';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) {
      throw new ForbiddenException({
        message: 'Truy cập bị từ chối: Người dùng không có quyền truy cập',
        error: 'Từ chối truy cập',
        statusCode: 403,
      });
    }
    const hasPermission = requiredRoles.some((role) => user.role === role);
    if (!hasPermission) {
      throw new ForbiddenException({
        message: `Truy cập bị từ chối: Yêu cầu role ${requiredRoles.join(', ')}`,
        error: 'Lỗi khi xác thực role',
        statusCode: 403,
      });
    }

    return true;
  }
}
