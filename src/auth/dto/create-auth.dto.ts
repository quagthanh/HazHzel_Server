import { Role, RoleStore } from '@/enum/role.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
  @IsNotEmpty()
  name: string;
}
export class CreateAdminAuthDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty({ message: 'Hãy chọn role Admin hoặc StoreOwner' })
  role: Role;
}
export class CreateStoreOwnerAuthDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty({ message: 'Hãy chọn role User hoặc StoreOwner' })
  @IsEnum(RoleStore)
  role: RoleStore;
}
