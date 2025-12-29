import { IsNotEmpty, IsNumber } from 'class-validator';

export class OrderDiscountDto {
  @IsNotEmpty()
  discountId: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  priceAtTime: number;
}
