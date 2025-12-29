import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class OrderItemDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @Min(0)
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  image?: string;
}
