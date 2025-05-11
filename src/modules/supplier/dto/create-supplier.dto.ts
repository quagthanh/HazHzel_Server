import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Tên supplier khong duoc trong' })
  name: string;
  @IsNotEmpty()
  contactName: string;

  @IsOptional()
  email: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  address: string;

  @IsOptional()
  description: string;

  @IsOptional()
  status: string;
}
