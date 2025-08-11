// src/shared/guards/permission.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '@/shared/decorators/permissions.decorator';
import {
  Permission as PermissionEntity,
  ActionPer,
  Permission,
} from '@/modules/permission/schemas/permission.schema';
import { UsersService } from '@/modules/users/users.service';
import { Role } from '@/modules/role/schemas/role.schema';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<{
      resource: string;
      action: keyof ActionPer;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Người dùng chưa xác thực');

    const fullUser = await this.usersService.findByIdWithRolesAndPermissions(
      user._id,
    );
    const hasPermission = (fullUser.roles as RolePopulated[]).some((role) =>
      (role.permissions ?? []).some(
        (perm) =>
          perm.resource === required.resource &&
          perm.action?.[required.action] === true,
      ),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing permission: ${required.resource}.${required.action}`,
      );
    }

    return true;
  }
}
interface RolePopulated extends Omit<Role, 'permissions'> {
  permissions: Permission[];
}
