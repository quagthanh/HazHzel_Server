import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDto {
  @IsOptional()
  name: string;
  @IsOptional()
  stock: number;
  @IsOptional()
  description: string;
  @IsOptional()
  categoryId: Types.ObjectId;
  @IsOptional()
  supplierId: Types.ObjectId;
  @IsOptional()
  images: string[];
  @IsOptional()
  status: string;
}
