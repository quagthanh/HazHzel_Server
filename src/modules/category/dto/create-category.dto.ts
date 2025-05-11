import { IsNotEmpty, IsOptional } from 'class-validator';
import { Mongoose, Types } from 'mongoose';

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parentId: Types.ObjectId;

  @IsOptional()
  image: string;

  @IsOptional()
  isActive: boolean;
}
