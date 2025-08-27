import { Permission } from '@/modules/permission/schemas/permission.schema';
import { Role } from '@/modules/role/schemas/role.schema';

export interface RolePopulated extends Omit<Role, 'permissions'> {
  permissions: Permission[];
}
