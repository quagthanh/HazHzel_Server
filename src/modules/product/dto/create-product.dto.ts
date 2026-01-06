import { GenderType } from '@/shared/enums/typeGenderProduct.enm';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { ProductAttributeDto } from './product-atribute.dto';

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
  gender: GenderType;

  @IsOptional()
  images: string[];

  @IsOptional()
  status: string;

  @IsOptional()
  isHot?: boolean;
}
