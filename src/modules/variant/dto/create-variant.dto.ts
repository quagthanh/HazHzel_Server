import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class VariantAttributeDto {
  @IsNotEmpty()
  @IsString()
  k: string;

  @IsNotEmpty()
  @IsString()
  v: string;
}

export class CreateVariantDto {
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

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsedObject = JSON.parse(value);
        return plainToInstance(VariantAttributeDto, parsedObject);
      } catch (error) {
        return [];
      }
    }

    return plainToInstance(VariantAttributeDto, value);
  })
  @IsArray({ message: 'Attributes phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes: VariantAttributeDto[];

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
