import { RoleEnum } from '@/shared/enums/role.enum';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class InternalCreateUser {
  @IsNotEmpty({ message: 'Hãy nhập email cho tài khoản muốn tạo' })
  email: string;
  @IsNotEmpty({ message: 'Hãy nhập mật khẩu cho tài khoản muốn tạo' })
  password: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  roles: Types.ObjectId[];
}
