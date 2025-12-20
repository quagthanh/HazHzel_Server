import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Supplier name is required' })
  name: string;

  @IsNotEmpty()
  contactName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  images: string[];

  @IsOptional()
  address?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  status?: string;
}
