import { RoleEnum } from '@/shared/enums/role.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class AuthResponseDto {
  user: UserResponseDto;
  access_token: string;
}
export class UserResponseDto {
  @IsNotEmpty({ message: 'Id is required' })
  _id: string;
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @IsNotEmpty({ message: 'Role is required' })
  roles: Array<string>;
}
