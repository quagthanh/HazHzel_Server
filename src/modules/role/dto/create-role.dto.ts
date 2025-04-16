import { RoleEnum } from '@/shared/enums/role.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsEnum(RoleEnum)
  @IsNotEmpty()
  name: string;
  @IsOptional()
  permissionId: string;
}
