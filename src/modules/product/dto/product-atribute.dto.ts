import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ProductAttributeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  values: string[];
}
