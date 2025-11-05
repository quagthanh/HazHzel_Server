import { IsNotEmpty, IsOptional } from 'class-validator';
import { Mongoose, Types } from 'mongoose';

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  slug?: string;
}
