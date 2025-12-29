import { AddToCartDto } from '@/modules/cart-item/dto/add-cart-item.dto';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

export class DeleteCartItemDto {
  @IsNotEmpty()
  cartItemId: string;
}
