import { RoleEnum } from '@/shared/enums/role.enum';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UpdateRoleDto {
  @IsMongoId({ message: 'Id không đúng định dạng' })
  @IsNotEmpty({ message: 'Id không được để trống' })
  _id: string;
  @IsEnum(RoleEnum)
  @IsOptional()
  name: string;

  @IsArray()
  permissionId: string[];
}
