import { RoleEnum } from '@/shared/enums/role.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
  @IsNotEmpty()
  name: string;
}
