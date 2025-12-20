import {
  IsString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  productId: Types.ObjectId;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  promoCodePrice?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  images: string[];

  @IsString()
  @IsOptional()
  sku?: string;
}
