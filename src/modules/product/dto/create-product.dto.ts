import { Variant } from '@/modules/variant/schemas/variant.schema';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  stock: number;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  categoryId: Types.ObjectId;
  @IsNotEmpty()
  supplierId: Types.ObjectId;
  @IsOptional()
  variants: Variant[];
  @IsOptional()
  images: string[];
  @IsOptional()
  status: string;
}
