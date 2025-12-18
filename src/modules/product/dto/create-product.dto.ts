import { Variant } from '@/modules/variant/schemas/variant.schema';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
  @IsOptional()
  slug: string;
  @IsNotEmpty()
  categoryId: Types.ObjectId;
  @IsNotEmpty()
  supplierId: Types.ObjectId;
  @IsOptional()
  views: number;
  @IsOptional()
  images: string[];
  @IsOptional()
  status: string;
}
