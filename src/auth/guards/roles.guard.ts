import { ROLES_KEY } from '@/shared/decorators/role.decorator';
import { RoleEnum } from '@/shared/enums/role.enum';
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
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user?.roles) {
      throw new ForbiddenException({
        message: 'Truy cập bị từ chối: Người dùng không có quyền truy cập',
        error: 'Từ chối truy cập',
        statusCode: 403,
      });
    }
    const hasPermission = requiredRoles.some((roles) => user.roles === roles);
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
