import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RestockDto {
  @IsNotEmpty()
  @IsMongoId()
  variantId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
