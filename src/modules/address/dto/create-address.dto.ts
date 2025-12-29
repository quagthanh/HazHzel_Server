import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddressDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  ward?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsOptional()
  zipCode?: string;

  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  typeAddress?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: string;
}
