import { AddToCartDto } from '@/modules/cart-item/dto/add-cart-item.dto';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export class CreateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddToCartDto)
  items: AddToCartDto[];
}
