import { IsNotEmpty } from 'class-validator';

export class CreateVariantDto {
  @IsNotEmpty()
  _id: string;
}
